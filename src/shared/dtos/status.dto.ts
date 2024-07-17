import { Exclude, Expose } from "class-transformer";
import { CustomResponse } from "../response-handle.helper";

@Exclude()
export class StatusDto {
    @Expose()
    status?: string;
}

export const responseStatus = CustomResponse(StatusDto);