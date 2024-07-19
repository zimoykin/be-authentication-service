import { Exclude, Expose, Transform } from "class-transformer";
import { CustomResponse } from "../../shared/response-handle.helper";

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

    @Expose()
    blocked?: Date;
}

export const responseUserDto = CustomResponse(UserResponseDto);