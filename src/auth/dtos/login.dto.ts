import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ILogin } from "../interfaces/login.interface";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto implements ILogin {

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: 'admin@mail.com'})
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Admin12345' })
    password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}