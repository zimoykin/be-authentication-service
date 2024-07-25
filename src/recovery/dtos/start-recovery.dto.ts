import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class StartRecoveryDto {
    @IsEmail()
    @IsString()
    @ApiProperty()
    email!: string;
}