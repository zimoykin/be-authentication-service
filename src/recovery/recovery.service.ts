import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { RecoveryRepository } from "./recovery.repository";
import { EmailService } from "src/email/email.service";
import { ConfigVariables } from "src/service-config";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Auth } from "src/auth/schemas/auth.schema";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class RecoveryService {
    private readonly logger = new Logger(RecoveryService.name);
    constructor(
        private readonly userService: UserService,
        private readonly recoveryRepository: RecoveryRepository,
        private readonly emailService: EmailService,
        private readonly config: ConfigService<ConfigVariables>,
        private readonly jwtService: JwtService,
        private readonly authService: AuthService
    ) { }
    private getConfirmationLink(confirmationToken: string) {
        const host = this.config.get('HOST')!;
        return `${host}/recovery/confirm?token=${confirmationToken}`;
    }

    private async veryifyTokenOrThrowAnError(token: string) {
        try {
            const secret = `recovery:${this.config.get('JWT_SECRET')!}`;
            const decodedToken = await this.jwtService.verify(token, { secret });
            return decodedToken;
        }
        catch (err) {
            this.logger.debug(err);
            throw new BadRequestException('confirmation token is invalid, recovery process declined');
        }
    }
    private generateRecoveryConfirmationLetter(email: string, code: string) {
        const secret = `recovery:${this.config.get('JWT_SECRET')!}`;
        const confirmationToken = this.jwtService.sign({ email: email }, { expiresIn: '1h', secret });

        const htmlConfirmLetter = `
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Registration Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f9f9f9;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .container {
                        background-color: white;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    .btn {
                        display: inline-block;
                        padding: 10px 20px;
                        margin-top: 20px;
                        font-size: 16px;
                        color: white;
                        background-color: #999Fff;
                        border: none;
                        border-radius: 5px;
                        text-decoration: none;
                        cursor: pointer;
                    }
                    .btn:hover {
                        background-color: #ffffff;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <p>Someone started the recovery process. If it was you, please confirm your intention by clicking the link below:</p>
                    <p> your confirmation code: ${code} </p>
                    <a href="${this.getConfirmationLink(confirmationToken)}" class="btn">Confirm Registration</a>
                </div>
            </body>
            </html>
        `;

        return htmlConfirmLetter;
    }

    async startRecoveryProcess(
        email: string
    ) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            this.logger.debug(`User with email ${email} not found`);
            throw new NotFoundException();
        }

        if (!user.confirmed) {
            this.logger.debug(`User with email ${email} not confirmed`);
            throw new BadRequestException();
        }
        const recovery = await this.recoveryRepository.createRecoveryProcess(email);

        await this.emailService.sendEmail('recovery confirmation',
            this.generateRecoveryConfirmationLetter(email, recovery.code), recovery.email);

        return { status: 'ok' };

    }

    async confirmRecoveryProcess(
        token: string,
        code: string,
        password: string
    ) {
        const decodedToken = await this.veryifyTokenOrThrowAnError(token);
        const email = decodedToken.email;
        if (!email) {
            this.recoveryRepository.deleteRecoveryProcess(email);
            throw new BadRequestException('confirmation token is invalid');
        }
        const user = await this.userService.findByEmail(email);
        if (!user) {
            this.logger.debug(`User with email ${email} not found`);
            throw new NotFoundException('user not found');
        }

        if (!user.confirmed) {
            this.logger.debug(`User with email ${email} not confirmed`);
            throw new BadRequestException('user not confirmed');
        }
        const recovery = await this.recoveryRepository.findRecoveryProcessByEmail(email);
        if (!recovery) {
            throw new NotFoundException('recovery process not found');
        }

        if (recovery.code !== code) {
            throw new BadRequestException('confirmation code is invalid');
        }

        const newAuth = Auth.new(email, password);
        await this.authService.updateUserPassword(newAuth);
        await this.recoveryRepository.deleteRecoveryProcess(email);
        await this.emailService.sendEmail('password changed', 'Your password has been changed', email);

        return { status: 'ok' };
    }
}