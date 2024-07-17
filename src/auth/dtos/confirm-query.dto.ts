import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ConfirmQueryDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    constructor(token: string) {
        this.token = token;
    }
}