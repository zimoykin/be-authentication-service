import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: User.name, schema: UserSchema
    }])
  ],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService]
})
export class UserModule { }
