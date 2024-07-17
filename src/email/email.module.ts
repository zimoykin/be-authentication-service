import { Module } from "@nestjs/common";
import { MailerModule } from '@nestjs-modules/mailer/';
import { ConfigService } from "@nestjs/config";
import { ConfigVariables } from "src/service-config";
import { EmailService } from "./email.service";

@Module({
    imports: [MailerModule.forRootAsync({
        useFactory: (
            config: ConfigService<ConfigVariables>
        ) => {
            return {
                transport: {
                    host: config.get('EMAIL_HOST')!,
                    port: parseInt(config.get('EMAIL_HOST')!),
                    secure: true,
                    auth: {
                        user: config.get('EMAIL_USERNAME')!,
                        pass: config.get('EMAIL_PASSWORD')!
                    }
                }
            };
        },
        inject: [ConfigService]
    })],
    controllers: [],
    providers: [EmailService],
    exports: [EmailService]
})
export class EmailModule { }