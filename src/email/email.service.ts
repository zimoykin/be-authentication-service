import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigVariables } from "../service-config";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly config: ConfigService<ConfigVariables>
    ) { }

    async sendEmail(subject: string, body: string, email: string) {
        this.logger.debug(`Sending email to ${email}`);
        return this.mailerService.sendMail({
            to: email,
            subject: subject,
            html: body,
            from: this.config.get<string>('EMAIL_USERNAME') ?? 'admin'
            //TODO: check how to use templates here
        });
    }
}