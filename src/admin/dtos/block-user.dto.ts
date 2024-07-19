import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "../../shared/dtos/base.dto";

export class AdminUserDto extends BaseDto {
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    userId!: string;
}