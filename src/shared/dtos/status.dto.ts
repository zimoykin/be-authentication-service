import { Exclude, Expose } from "class-transformer";
import { CustomResponse } from "../response-handle.helper";
import { BaseDto } from "./base.dto";

@Exclude()
export class StatusDto extends BaseDto {
    @Expose()
    status?: string;
}

export const responseStatus = CustomResponse(StatusDto);