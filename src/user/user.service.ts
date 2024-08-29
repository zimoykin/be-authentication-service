import { Injectable, Logger } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { USER_ROLE } from '../auth/enums/user-role.enum';
import { UserModelRepository } from '@zimoykin/models';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(
        private readonly userRepo: UserModelRepository,
    ) { }
    async findUserById(id: string) {
        return this.userRepo.findUserById(id);
    }

    async findAllUsers() {
        return this.userRepo.findAllUsers();
    }

    async findAllBlockedUsers() {
        return this.userRepo.findAllBlockedUsers();
    }

    async findByEmail(email: string, confirmed?: boolean) {
        return this.userRepo.findByEmail(email, confirmed);
    }

    async updateByEmail(email: string, role: USER_ROLE, name: string, session: ClientSession) {
        return this.userRepo.updateByEmail(email, role, name, session);
    }

    async confirmUserByEmail(email: string, session: ClientSession) {
        return this.userRepo.confirmUserByEmail(email, session);
    }

    async deleteByEmail(email: string) {
        return this.userRepo.deleteByEmail(email);
    }


    async blockUserById(userId: string) {
        return this.userRepo.blockUserById(userId);
    }

    async unblockUserById(userId: string) {
        return this.userRepo.unblockUserById(userId);
    }

    async deleteByUserId(userId: string, session: ClientSession) {
        return this.userRepo.deleteByUserId(userId, session);
    }
}
