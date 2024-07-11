import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Logger, Post, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from '../shared/jwt.guard';
import { AuthUser } from '../shared/decorators/user.decorator';
import { IAuthUser } from './interfaces/auth-user.interface';
import { RefreshDto } from './dtos/refresh.dto';
import { UserOutputDto } from './dtos/user-output.dto';
import { TokensResponseDto } from './dtos/tokens-response.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {

    private readonly logger = new Logger(AuthController.name);

    constructor(
        private readonly service: AuthService
    ) { }

    @Post('register')
    async register(
        @Body() dto: RegisterDto
    ): Promise<{ status: string; }> {
        return this.service.register(dto)
            .then(() => ({ status: 'created' }))
            .catch(error => {
                this.logger.debug(error);
                throw error?.message ?? 'register error';
            });
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto
    ): Promise<TokensResponseDto> {
        return this.service.login(dto)
            .then(({ accessToken, refreshToken }) => new TokensResponseDto(accessToken, refreshToken))
            .catch(error => {
                this.logger.debug(error);
                throw error?.message ?? 'login error';
            });
    }

    @Get('me')
    @UseGuards(AuthGuard)
    @SerializeOptions({ type: UserOutputDto, excludeExtraneousValues: true, exposeDefaultValues: true })
    async me(
        @AuthUser() user: IAuthUser
    ) {
        return this.service.me(user.id).then(user => new UserOutputDto(user)).catch(error => {
            this.logger.debug(error);
            throw error?.message ?? 'method me throw an error';
        });
    }

    @Post('refresh')
    async refresh(
        @Body() dto: RefreshDto
    ): Promise<TokensResponseDto> {
        return this.service.refresh(dto).then(({ accessToken, refreshToken }) => new TokensResponseDto(accessToken, refreshToken)).catch(error => {
            this.logger.debug(error);
            throw error?.message ?? 'refresh tokens error';
        });
    }

    @Delete('delete')
    @UseGuards(AuthGuard)
    async delete(
        @AuthUser() user: IAuthUser
    ) {
        return this.service.deleteMe(user.email);
    }
}
