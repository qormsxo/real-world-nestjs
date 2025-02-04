import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Profile } from '../profile/profile.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();  // .env 파일을 로드하여 process.env에 환경 변수 추가

@Module({
  imports: [
    JwtModule.register({
        secret: process.env.JWT_SECRET || 'yourSecretKey',  // JWT_SECRET이 없으면 기본값으로 'yourSecretKey' 사용
        signOptions: { expiresIn: '1h' },  // 1시간 후 만료
    }),
    TypeOrmModule.forFeature([User, Profile]), // User, Profile 엔티티를 TypeOrm에 등록
  ],
  providers: [UserService], 
  controllers: [UserController],
})
export class UserModule {}