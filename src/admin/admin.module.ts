import { Module, OnModuleInit } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { EmailModule } from "../email/email.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [UserModule, AuthModule, EmailModule, JwtModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
