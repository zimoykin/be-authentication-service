import { Exclude, Expose, Transform } from "class-transformer";
import { USER_ROLE } from "../enums/user-role.enum";
import { CustomResponse } from "../../shared/response-handle.helper";
import { BaseDto } from "../../shared/dtos/base.dto";

@Exclude()
export class UserOutputDto extends BaseDto {
    @Expose({ name: 'id' })
    @Transform(({ obj }) => obj._id?.toString())
    _id?: string;

    @Expose()
    email?: string;

    @Expose()
    name?: string;

    @Expose()
    role?: USER_ROLE;

    @Exclude()
    confirmed?: boolean;
}

export const responseUserDto = CustomResponse(UserOutputDto);