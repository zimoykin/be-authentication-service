import { Body, Controller, Delete, Get, Logger, Post, Query, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from '../shared/guards/user-jwt.guard';
import { AuthUser } from '../shared/decorators/user.decorator';
import { IAuthUser } from './interfaces/auth-user.interface';
import { RefreshDto } from './dtos/refresh.dto';
import { responseUserDto } from './dtos/user-output.dto';
import { responseTokensDto, TokensResponseDto } from './dtos/tokens-response.dto';
import { responseStatus, StatusDto } from '../shared/dtos/status.dto';
import { ConfirmQueryDto } from './dtos/confirm-query.dto';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';


@Controller('api/v1/auth')
@ApiTags('Auth')
export class AuthControllerV1 {

    private readonly logger = new Logger(AuthControllerV1.name);

    constructor(
        private readonly service: AuthService
    ) { }

    @Post('register')
    async register(
        @Body() dto: RegisterDto
    ): Promise<StatusDto> {
        return responseStatus(
            this.service.register(dto)
        );
    }

    @Get('confirm')
    @ApiParam({ name: 'token' })
    async confirm(
        @Query() dto: ConfirmQueryDto,
        @Res() res: Response
    ): Promise<StatusDto> {
        return responseStatus(
            this.service.confirm(dto.token)
        ).finally(() => {
            res.redirect('/confirmed');
        });
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto
    ): Promise<TokensResponseDto> {
        return responseTokensDto(
            this.service.login(dto)
        );
    }

    @Get('me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('Authorization')
    async me(
        @AuthUser() user: IAuthUser
    ) {
        return responseUserDto(this.service.me(user.id));
    }

    @Post('refresh')
    async refresh(
        @Body() dto: RefreshDto
    ): Promise<TokensResponseDto> {
        return responseTokensDto(this.service.refresh(dto));
    }

    @ApiBearerAuth('Authorization')
    @Delete('delete')
    @UseGuards(AuthGuard)
    async delete(
        @AuthUser() user: IAuthUser
    ): Promise<StatusDto> {
        return responseStatus(this.service.deleteMe(user.email));
    }
}
