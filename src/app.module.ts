import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigVariables, serviceSchema } from './service-config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<ConfigVariables>) => {

        const userName = config.get('MONGO_USERNAME');
        const password = config.get('MONGO_PASSWORD');
        const database = config.get('MONGO_DATABASE');
        const templateUri = config.get<string>('MONGO_CONNECTION')!;

        const uri = templateUri.replace('<username>', userName).replace('<password>', password).replace('<database>', database);

        return { uri };

      }, inject: [ConfigService]
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema
    }),
    PassportModule,
    UserModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
