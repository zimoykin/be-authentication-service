import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Connection, Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Auth } from './schemas/auth.schema';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '../service-config';
import { RefreshDto } from './dtos/refresh.dto';
import { ConfirmService } from './confirm.service';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {

    logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService<ConfigVariables>,
        private readonly confirmService: ConfirmService,
        private readonly emailService: EmailService,
        private readonly userService: UserService,
        /* eslint-disable */
        // @ts-ignore //
        @InjectConnection() private readonly mongoose: Connection,
        /* eslint-disable */
        // @ts-ignore //
        @InjectModel(Auth.name) private readonly authRepo: Model<Auth>
    ) { }

    async register(dto: RegisterDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (user) throw new ConflictException();
        else {
            const auth = Auth.new(dto.email, dto.password);
            const session = await this.mongoose.startSession();

            await this.authRepo
                .updateOne({ email: dto.email }, { $set: auth }, { upsert: true, new: true })
                .session(session).catch(err => {
                    this.logger.debug(err);
                    session.abortTransaction();
                    throw new InternalServerErrorException();
                });

            await this.userService.updateByEmail(dto.email, dto.role, dto.name, session)
                .catch(err => {
                    this.logger.debug(err);
                    session.abortTransaction();
                    throw new InternalServerErrorException();
                });
            const confirmationLetter = this.confirmService.genereateConfirmationLetter(dto.email);
            await this.emailService.sendEmail('Confirm your email', confirmationLetter, dto.email).catch(err => {
                this.logger.debug(err);
                session.abortTransaction();
                throw new InternalServerErrorException();
            });

            await this.confirmService.addConfirmationProcess(dto.email);
            session.endSession();
            return { status: 'created' };
        }
    }

    async confirm(token: string) {
        const tokenData = await this.jwtService.verifyAsync<{ email: string; }>(token, { secret: `confirmation:${this.config.get('JWT_SECRET')!}` });
        const user = await this.userService.findByEmail(tokenData.email, false);
        if (!user) {
            this.logger.debug(`non confirmed user ${tokenData.email} not found`);
            throw new NotFoundException();
        }

        const session = await this.mongoose.startSession();
        try {
            await this.userService.confirmUserByEmail(tokenData.email, session);
            await this.emailService.sendEmail('Email confirmed', 'Your email has been confirmed', tokenData.email);
            await this.confirmService.deleteConfirmationProcess(tokenData.email, session);
        } catch (error) {
            this.logger.debug(error);
            await session.abortTransaction();
            throw error;
        }

        await session.endSession();
        return { status: 'confirmed' };

    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email, true);
        if (!user)
            throw new NotFoundException('user not found');
        else {

            //sec
            const authDocument = await this.authRepo.findOne({ email: dto.email }).lean();
            const auth = new Auth();
            Object.assign(auth, authDocument);

            if (!auth.checkPassword(dto.password)) {
                throw new BadRequestException();
            };

            const secret = this.config.get('JWT_SECRET');
            const accessToken = this.jwtService.sign({ id: user._id.toString(), role: user.role, email: user.email }, { expiresIn: '1h', secret });
            const refreshToken = this.jwtService.sign({ id: user._id.toString(), role: user.role, email: user.email }, { expiresIn: '7d', secret });

            return { accessToken, refreshToken };
        }
    }

    async refresh(dto: RefreshDto) {
        const secret = this.config.get('JWT_SECRET');
        const decoded = this.jwtService.verify<{ id: string, role: string; }>(dto.refreshToken, { secret });
        if (decoded) {
            const user = await this.userService.findUserById(decoded.id);
            if (!user) throw new NotFoundException();
            return {
                accessToken: this.jwtService.sign({ id: user?._id?.toString(), role: user?.role, email: user?.email }, { secret, expiresIn: '1h' }),
                refreshToken: this.jwtService.sign({ id: user?._id.toString(), role: user?.role, email: user?.email }, { secret, expiresIn: '7d' })
            };
        }
        else throw new BadRequestException();
    }

    async me(userId: string): Promise<User> {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }

    async deleteMe(email: string): Promise<{ status: string; }> {
        await this.authRepo.deleteMany({ email });
        await this.userService.deleteByEmail(email);

        return { status: 'ok' };
    }
}
