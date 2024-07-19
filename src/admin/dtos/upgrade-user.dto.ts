import { IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "../../shared/dtos/base.dto";
import { USER_ROLE } from "src/auth/enums/user-role.enum";

export class UpgradeUserDto extends BaseDto {
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    userId!: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(USER_ROLE)
    role!: USER_ROLE;
}