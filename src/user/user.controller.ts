import { Controller, Get, Logger, NotAcceptableException, Param, UseGuards } from '@nestjs/common';
import { IAuthUser } from '../auth/interfaces/auth-user.interface';
import { AuthUser } from '../shared/decorators/user.decorator';
import { UserService } from './user.service';
import { USER_ROLE } from '../auth/enums/user-role.enum';
import { responseUserDto } from './dtos/user-response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../shared/guards/admin-jwt.guard';

@UseGuards(AdminGuard)
@ApiBearerAuth('Authorization')
@ApiTags('User')
@Controller('api/v1/user')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(
        private readonly userService: UserService
    ) { }

    @Get(':id')
    async getUserById(
        @AuthUser() user: IAuthUser,
        @Param('id') id: string) {
        this.logger.debug('Getting user by id');

        if (user.role !== USER_ROLE.ADMIN) {
            throw new NotAcceptableException('Only admin can get all users');
        }
        return responseUserDto(this.userService.findUserById(id));
    }

    @Get()
    async getAllUsers(
        @AuthUser() user: IAuthUser
    ) {
        this.logger.debug('Getting all users');
        if (user.role !== USER_ROLE.ADMIN) {
            throw new NotAcceptableException('Only admin can get all users');
        }
        return responseUserDto(this.userService.findAllUsers());
    }

}
