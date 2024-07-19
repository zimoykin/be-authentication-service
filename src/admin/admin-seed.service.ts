import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Connection } from "mongoose";
import { AuthService } from "../auth/auth.service";
import { USER_ROLE } from "../auth/enums/user-role.enum";
import { ConfigVariables } from "../service-config";
import { UserService } from "../user/user.service";
import { InjectConnection } from "@nestjs/mongoose";

@Injectable()
export class AdminSeedService implements OnModuleInit {
    private readonly logger = new Logger(AdminSeedService.name);
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly configService: ConfigService<ConfigVariables>,
        /* eslint-disable */
        // @ts-ignore //
        @InjectConnection() private readonly mongoose: Connection,
    ) { }
    async onModuleInit() {
        this.logger.debug('Admin service initialized');
        const seedAdminEmail = this.configService.get<string>('USER_ADMIN_EMAIL')!;
        const seedAdminPassword = this.configService.get<string>('USER_ADMIN_PASSWORD')!;

        const seed = await this.userService.findByEmail(seedAdminEmail);

        if (!seed) {
            this.logger.debug('Seeding admin user');
            const session = await this.mongoose.startSession();
            session.startTransaction();
            try {
                await this.authService.createAuthByEmailAndPassword(seedAdminEmail, seedAdminPassword, session);
                await this.userService.updateByEmail(seedAdminEmail, USER_ROLE.ADMIN, 'admin', session);
                await this.userService.confirmUserByEmail(seedAdminEmail, session);
                // await this.userService.updateByEmail(seedAdminEmail, USER_ROLE.ADMIN, 'admin', session);

                await session.commitTransaction();
                this.logger.debug(`Admin user seeded ${seedAdminEmail}`);
            } catch (error) {
                this.logger.debug(error);
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        }

    }



}