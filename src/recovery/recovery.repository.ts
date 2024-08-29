import { Injectable, Logger } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { Recovery } from "./schemas/recovery.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class RecoveryRepository {
    private readonly logger = new Logger(RecoveryRepository.name);
    constructor(
        /* eslint-disable */
        // @ts-ignore //
        @InjectModel(Recovery.name) private readonly model: Model<Recovery & Document>
    ) { }

    async createRecoveryProcess(
        email: string
    ) {
        const recovery = new Recovery(email);
        await this.model.updateOne({ email }, recovery, { upsert: true, new: true }).lean();
        return recovery;
    }

    async findRecoveryProcessByEmail(email: string) {
        return this.model.findOne({ email }).lean();
    }

    async deleteRecoveryProcess(email: string): Promise<any> {
        return this.model.deleteOne({ email }).lean();
    }
}