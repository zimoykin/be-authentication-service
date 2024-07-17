import { Exclude, Expose } from "class-transformer";
import { CustomResponse } from "src/shared/response-handle.helper";

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

export const responseTokensDto = CustomResponse(TokensResponseDto);