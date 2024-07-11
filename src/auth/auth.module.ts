import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from 'src/service-config';
import { JwtStrategy } from 'src/shared/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService<ConfigVariables>) => {
        return { secret: config.get<string>('JWT_SECRET')! };
      }, inject: [ConfigService]
    }),
    MongooseModule.forFeature([{
      name: Auth.name, schema: AuthSchema
    }, {
      name: User.name, schema: UserSchema
    }])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy]
})
export class AuthModule { }
