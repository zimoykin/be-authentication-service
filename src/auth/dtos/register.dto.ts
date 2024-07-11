import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";
import { IRegister } from "../interfaces/register.interface";
import { USER_ROLE } from "../enums/user-role.enum";

export class RegisterDto implements IRegister {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    role: USER_ROLE;

    @IsNotEmpty()
    @IsString()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    password: string;

    constructor(data: any) {
        this.email = data.email;
        this.name = data.name;
        this.url = data.url;
        this.role = data.role;
        this.password = data.password;
    }
}