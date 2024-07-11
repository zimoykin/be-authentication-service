import { IsEmail, IsNotEmpty, IsString, Max, Min } from "class-validator";
import { ILogin } from "../interfaces/login.interface";

export class LoginDto implements ILogin {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}