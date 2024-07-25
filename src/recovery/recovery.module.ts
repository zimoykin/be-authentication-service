import { Module } from "@nestjs/common";
import { RecoveryService } from "./recovery.service";
import { RecoveryController } from "./recovery.controller";
import { UserModule } from "../user/user.module";
import { EmailModule } from "../email/email.module";
import { RecoveryRepository } from "./recovery.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { Recovery, RecoverySchema } from "./schemas/recovery.schema";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";


@Module({
    imports: [
        JwtModule,
        MongooseModule.forFeature([
            { name: Recovery.name, schema: RecoverySchema }
        ]),
        UserModule,
        EmailModule,
        AuthModule
    ],
    controllers: [RecoveryController],
    providers: [RecoveryService, RecoveryRepository],
    exports: []
})
export class RecoveryModule { }