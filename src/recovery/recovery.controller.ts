import { Body, Controller, HttpCode, Logger, Post } from "@nestjs/common";
import { StartRecoveryDto } from "./dtos/start-recovery.dto";
import { RecoveryService } from "./recovery.service";
import { ApiTags } from "@nestjs/swagger";
import { responseStatus } from "src/shared/dtos/status.dto";
import { RecoveryConfirmDto } from "./dtos/confirm-recovery.dto";

@ApiTags('Recovery')
@Controller('api/v1/recovery')
export class RecoveryController {
    private readonly logger = new Logger(RecoveryController.name);

    constructor(
        private readonly recoveryService: RecoveryService
    ) { }


    @HttpCode(200)
    @Post('start-process')
    async startRecoveryProcess(
        @Body() startRecoveryDto: StartRecoveryDto
    ): Promise<void> {
        this.logger.debug(`Recovery process started for ${startRecoveryDto.email}`);
        return responseStatus(this.recoveryService.startRecoveryProcess(startRecoveryDto.email));
    }

    @HttpCode(200)
    @Post('confirm')
    async confirmRecoveryProcess(
        @Body() dto: RecoveryConfirmDto
    ): Promise<void> {
        this.logger.debug(`Recovery process confirmed for ${dto.code}`);
        return responseStatus(this.recoveryService.confirmRecoveryProcess(dto.token, dto.code, dto.password));
    }
}