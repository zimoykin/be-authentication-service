import { Module } from '@nestjs/common';
import { AuthControllerV1 } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '../service-config';
import { JwtStrategy } from '../shared/jwt.strategy';
import { ConfirmService } from './confirm.service';
import { Confirmation, ConfirmSchema } from './schemas/confirmation.schema';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    EmailModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService<ConfigVariables>) => {
        return { secret: config.get<string>('JWT_SECRET')! };
      }, inject: [ConfigService]
    }),
    MongooseModule.forFeature([{
      name: Auth.name, schema: AuthSchema
    }, {
      name: Confirmation.name, schema: ConfirmSchema
    }])
  ],
  controllers: [AuthControllerV1],
  providers: [AuthService, ConfirmService, JwtService, JwtStrategy],
  exports:[AuthService]
})
export class AuthModule { }
