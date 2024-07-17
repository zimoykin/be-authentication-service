import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { USER_ROLE } from '../auth/enums/user-role.enum';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(
        /* eslint-disable */
        // @ts-ignore //
        @InjectModel(User.name) private readonly userRepo: Model<User>,
    ) { }
    async findUserById(id: string) {
        return this.userRepo.findOne({ _id: id });
    }

    async findAllUsers() {
        return this.userRepo.find({ confirmed: true }).lean();
    }

    async findByEmail(email: string, confirmed?: boolean) {
        const query = {
            email: email
        };
        if (confirmed != undefined) {
            query['confirmed'] = confirmed;
        }
        return this.userRepo.findOne(query);
    }

    async updateByEmail(email: string, role: USER_ROLE, name: string, session: ClientSession) {
        return this.userRepo.updateOne({ email: email }, { $set: { email: email, role: role, confirmed: false, name: name } }, { upsert: true, new: true }).session(session);
    }

    async confirmUserByEmail(email: string, session: ClientSession) {
        return this.userRepo.updateOne({ email: email }, { $set: { confirmed: true } }, { upsert: false, new: true }).session(session);
    }

    async deleteByEmail(email: string) {
        return this.userRepo.deleteOne({ email: email });
    }
}
