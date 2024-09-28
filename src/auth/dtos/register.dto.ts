import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { IRegister } from "../interfaces/register.interface";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto implements IRegister {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: 'admin@admin.com' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'admin' })
    name: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'https://admin.com' })
    url: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    @ApiProperty({ example: 'Admin12345' })
    password: string;

    constructor(data: any) {
        this.email = data?.email;
        this.name = data?.name;
        this.url = data?.url;
        this.password = data?.password;
    }
}