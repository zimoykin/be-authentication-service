import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'refreshToken jwt' })
    refreshToken: string;

    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
    }
}