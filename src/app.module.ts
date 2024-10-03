import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigVariables, serviceSchema } from './service-config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from './email/email.module';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { RecoveryModule } from './recovery/recovery.module';
import { AmqpModule } from '@zimoykin/amqp';

@Module({
  imports: [
    AmqpModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        const url = config.get<string>('RMQ_URL')!;
        return { url };
      },
      inject: [ConfigService]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<ConfigVariables>) => {
        const uri = config.get<string>('MONGO_CONNECTION')!;
        return { uri };

      }, inject: [ConfigService]
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema
    }),
    PassportModule,
    UserModule,
    AuthModule,
    EmailModule,
    AdminModule,
    RecoveryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
