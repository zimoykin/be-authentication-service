import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ConfirmQueryDto {
    @IsString()
    @IsNotEmpty()
    token?: string;

    @IsString()
    @IsNotEmpty()
    code?: string;
}