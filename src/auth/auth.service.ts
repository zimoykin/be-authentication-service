import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ClientSession, Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Auth } from './schemas/auth.schema';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '../service-config';
import { RefreshDto } from './dtos/refresh.dto';
import { ConfirmService } from './confirm.service';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { USER_ROLE } from './enums/user-role.enum';

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

        if (user) {
            throw new ConflictException('User with this email already exists');
        } else {
            const session = await this.mongoose.startSession();
            session.startTransaction();

            try {
                // Create user auth record
                await this.createAuthByEmailAndPassword(dto.email, dto.password, session);
                // Update user information
                await this.userService.updateByEmail(dto.email, USER_ROLE.USER, dto.name, session);

                // Send confirmation email
                const confirmationLetter = this.confirmService.generateConfirmationLetter(dto.email);
                await this.emailService.sendEmail('Confirm your email', confirmationLetter, dto.email);

                // Add confirmation process
                await this.confirmService.addConfirmationProcess(dto.email);

                // Commit the transaction
                await session.commitTransaction();
            } catch (error) {
                this.logger.error('Error in registration process:', error);

                // Rollback transaction on error
                await session.abortTransaction();
                throw new InternalServerErrorException('Registration failed. Please try again.');
            } finally {
                // End the session
                session.endSession();
            }

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
        session.startTransaction();
        try {
            await this.userService.confirmUserByEmail(tokenData.email, session);
            await this.emailService.sendEmail('Email confirmed', 'Your email has been confirmed', tokenData.email);
            // await this.confirmService.deleteConfirmationProcess(tokenData.email, session);
            await session.commitTransaction();
        } catch (error) {
            this.logger.debug(error);
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }

        return { status: 'confirmed' };

    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email, true);
        if (!user)
            throw new NotFoundException('user not found');
        else {
            const authDocument = await this.authRepo.findOne({ email: dto.email }).lean();
            if (!authDocument)
                throw new NotFoundException('user not found');
            const auth = new Auth();
            Object.assign(auth, authDocument);

            if (!auth.checkPassword(dto.password)) {
                throw new BadRequestException('wrong password or email');
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

    async me(userId: string): Promise<any> {
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

    async deleteByUserId(userId: string, session: ClientSession) {
        await this.authRepo.deleteMany({ userId: userId }).session(session);
    }

    async createAuthByEmailAndPassword(email: string, password: string, session: ClientSession): Promise<any> {
        // Upsert the auth data
        const auth = Auth.new(email, password);
        return this.authRepo
            .updateOne({ email: email }, { $set: auth }, { upsert: true })
            .session(session);
    }

    async updateUserPassword(auth: Auth): Promise<any> {
        return this.authRepo.updateOne({ email: auth.email }, { $set: auth });
    }
}
