import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { ProfileRepository } from '../profile/profile.repository';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';
import { TagRepository } from './tag.repository';
import { TagController } from './tag.controller';
dotenv.config();  // .env 파일을 로드하여 process.env에 환경 변수 추가

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]), // User, Profile 엔티티를 TypeOrm에 등록
  ],
  providers: [TagService, TagRepository], 
  controllers: [TagController],
})
export class TagModule {}