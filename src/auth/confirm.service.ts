import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ConfigVariables } from "../service-config";
import { Confirmation } from "./schemas/confirmation.schema";
import { ClientSession, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class ConfirmService {

    logger = new Logger(ConfirmService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService<ConfigVariables>,
        /* eslint-disable */
        // @ts-ignore //
        @InjectModel(Confirmation.name) private readonly confirmationRepo: Model<Confirmation>
    ) { }

    private getConfirmationLink(confirmagtionToken: string) {
        const host = this.config.get('HOST')!;
        return `${host}/v1/auth/confirm?token=${confirmagtionToken}`;
    }

    generateConfirmationLetter(email: string) {
        const secret = `confirmation:${this.config.get('JWT_SECRET')!}`;
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
                    <p>Someone started the registration process. If it was you, please confirm your intention by clicking the link below:</p>
                    <a href="${this.getConfirmationLink(confirmationToken)}" class="btn">Confirm Registration</a>
                </div>
            </body>
            </html>
        `;

        return htmlConfirmLetter;
    }

    async addConfirmationProcess(email: string) {
        const confirmation = new Confirmation(email);
        await this.confirmationRepo.create(confirmation);
        return confirmation;
    }

    async deleteConfirmationProcess(email: string, session: ClientSession) {
        return this.confirmationRepo.deleteOne({ email: email }).session(session);
    }

}