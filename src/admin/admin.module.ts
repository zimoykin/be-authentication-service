import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { EmailModule } from "../email/email.module";
import { JwtModule } from "@nestjs/jwt";
import { AdminSeedService } from "./admin-seed.service";

@Module({
    imports: [UserModule, AuthModule, EmailModule, JwtModule],
    controllers: [AdminController],
    providers: [AdminService, AdminSeedService],
})
export class AdminModule { }
