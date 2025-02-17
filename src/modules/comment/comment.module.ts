import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import * as dotenv from 'dotenv';
import { Comment } from '../comment/comment.entity';
import { Article } from '../article/article.entity';
import { CommentService } from './comment.service';
import { ArticleService } from '../article/article.service';
import { CommentController } from './comment.controller';
import { ArticleModule } from '../article/article.module';
dotenv.config();  // .env 파일을 로드하여 process.env에 환경 변수 추가


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment,Article,User]),
    ArticleModule
  ],
  providers: [CommentService,ArticleService],
  controllers: [CommentController],
})
export class CommentModule { }