import { Exclude, Expose, Transform, Type } from "class-transformer";
import { CustomResponse } from "src/shared/response-handle.helper";

@Exclude()
export class UserResponseDto {
    @Expose({ name: 'id' })
    @Transform(({ obj }) => obj?._id?.toString())
    _id?: string;

    @Expose()
    email?: string;

    @Expose()
    role?: string;

    @Expose()
    name?: string;

    @Expose()
    confirmed?: boolean;
}

export const responseUserDto = CustomResponse(UserResponseDto);