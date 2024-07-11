import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Connection, Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Auth } from './schemas/auth.schema';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from 'src/service-config';
import { RefreshDto } from './dtos/refresh.dto';
// import { generateHash } from 'src/shared/security';
import { UserOutputDto } from './dtos/user-output.dto';

@Injectable()
export class AuthService {

    logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService<ConfigVariables>,
        /* eslint-disable */
        // @ts-ignore //
        @InjectConnection() private readonly mongoose: Connection,
        /* eslint-disable */
        // @ts-ignore //
        @InjectModel(User.name) private readonly userRepo: Model<User>,
        /* eslint-disable */
        // @ts-ignore //
        @InjectModel(Auth.name) private readonly authRepo: Model<Auth>
    ) { }

    async register(dto: RegisterDto) {
        const user = await this.userRepo.findOne({ email: dto.email });
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
            await this.userRepo.updateOne({ email: dto.email }, { $set: { email: dto.email, role: 'admin', confirmed: false, name: dto.name, urk: dto.url } }, { upsert: true, new: true }).session(session)
                .catch(err => {
                    this.logger.debug(err);
                    session.abortTransaction();
                    throw new InternalServerErrorException();
                });

            session.endSession();

            return { status: 'created' };
        }
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ email: dto.email, confirmed: true });
        if (!user)
            throw new NotFoundException('user npt found');
        else {

            //sec
            const authDocument = await this.authRepo.findOne({ email: dto.email }).lean();
            const auth = new Auth();
            Object.assign(auth, authDocument);

            if (!auth.checkPassword(dto.password)) {
                throw new BadRequestException();
            };

            const secret = this.config.get('JWT_SECRET');
            const accessToken = this.jwtService.sign({ id: user._id.toString(), role: user.role, email: user.email }, { expiresIn: '1d', secret });
            const refreshToken = this.jwtService.sign({ id: user._id.toString(), role: user.role, email: user.email }, { expiresIn: '7d', secret });

            return { accessToken, refreshToken };
        }
    }

    async refresh(dto: RefreshDto) {
        const secret = this.config.get('JWT_SECRET');
        const decoded = this.jwtService.verify<{ id: string, role: string; }>(dto.refreshToken, { secret });
        if (decoded) {
            const user = await this.userRepo.findById(decoded.id);
            if (!user) throw new NotFoundException();
            return {
                accessToken: this.jwtService.sign({ id: user?._id?.toString(), role: user?.role, email: user?.email }, { secret, expiresIn: '1d' }),
                refreshToken: this.jwtService.sign({ id: user?._id.toString(), role: user?.role, email: user?.email }, { secret, expiresIn: '7d' })
            };
        }
        else throw new BadRequestException();
    }

    async me(userId: string): Promise<User> {
        const user = await this.userRepo.findOne({ '_id': userId }).lean();
        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }

    async deleteMe(email: string): Promise<{ status: string; }> {
        await this.authRepo.deleteMany({ email });
        await this.userRepo.deleteMany({ email });

        return { status: 'ok' };
    }
}
