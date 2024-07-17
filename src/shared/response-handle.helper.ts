import { BadRequestException, ConflictException, Logger, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

const responseLogger = new Logger('ResponseHandle');

export const CustomResponse = <T>(cls: new (...data: any) => T) => {
    return async function safetyResponseHandle<R = T | T[]>(result: Promise<R>): Promise<any> {
        return result.then(data => {
            return Array.isArray(data) ? data.map(item => plainToInstance(cls, item)) : plainToInstance(cls, data);
        }).catch(error => {
            responseLogger.error(error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error?.message);
            }
            else if (error instanceof BadRequestException) {
                throw new BadRequestException(error?.message);
            } else if (error instanceof ConflictException) {
                throw new ConflictException(error?.message);
            } else
                throw new Error(error?.message ?? 'unknown error');
        });
    };
};