import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
    @IsString() @IsNotEmpty()
    refreshToken: string;

    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
    }
}