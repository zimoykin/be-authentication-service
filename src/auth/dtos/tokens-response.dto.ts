import { Exclude, Expose } from "class-transformer";

@Exclude()
export class TokensResponseDto {
    @Expose()
    accessToken: string;
    @Expose()
    refreshToken: string;

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}