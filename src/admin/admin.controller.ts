import { Body, Controller, Delete, Get, Logger, Param, Post, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminUserDto } from "./dtos/block-user.dto";
import { AdminGuard } from "../shared/guards/admin-jwt.guard";
import { responseStatus } from "../shared/dtos/status.dto";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { UpgradeUserDto } from "./dtos/upgrade-user.dto";
import { responseUserDto } from "src/user/dtos/user-response.dto";

@ApiTags('Admin')
@Controller('api/v1/admin')
@UseGuards(AdminGuard)
@ApiBearerAuth('Authorization')
export class AdminController {
    private readonly logger = new Logger(AdminController.name);

    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('block')
    async blockUserById(
        @Body() data: AdminUserDto
    ) {
        return responseStatus(
            this.adminService.blockUserById(data.userId)
        );
    }


    @Get('blocked-users')
    async getBlockedUsers() {
        return responseUserDto(
            this.adminService.getBlockedUsers()
        );
    }

    @Post('unblock')
    async unblockUserById(
        @Body() data: AdminUserDto
    ) {
        return responseStatus(
            this.adminService.unblockUserById(data.userId)
        );
    }
    @Delete('permanent-delete/:userId')
    @ApiParam({ name: 'userId' })
    async permanentDeleteUserById(
        @Param() params: AdminUserDto
    ) {
        return responseStatus(
            this.adminService.permanentDeleteUserById(params.userId)
        );
    }


    @Post('upgrade-user/:userId/:role')
    @ApiParam({ name: 'userId'})
    @ApiParam({ name: 'role' })
    updagreUserToAdmin(
        @Param() params: UpgradeUserDto
    ) {
        return responseStatus(
            this.adminService.upgradeUserRole(params.userId, params.role)
        );
    }

}