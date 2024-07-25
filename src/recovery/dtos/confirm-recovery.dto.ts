import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class RecoveryConfirmDto {
    @IsString()
    @ApiProperty()
    token!: string;

    @IsString()
    @ApiProperty()
    code!: string;

    @IsString()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    @ApiProperty({ example: 'Admin12345' })
    password!: string;
}