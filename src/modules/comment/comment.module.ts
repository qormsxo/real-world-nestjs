import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import * as dotenv from 'dotenv';
import { Comment } from '../comment/comment.entity';
import { Article } from '../article/article.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { ArticleModule } from '../article/article.module';
import { ArticleRepository } from '../article/article.repository';
import { Tag } from '../tag/tag.entity';
import { Follow } from '../follow/follow.entity';
import { Favorite } from '../favorite/favorite.entity';
import { CommentRepository } from './comment.repository';
dotenv.config();  // .env 파일을 로드하여 process.env에 환경 변수 추가


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment,Article,User,Tag,Follow, Favorite]),
    ArticleModule
  ],
  providers: [CommentService,CommentRepository],
  controllers: [CommentController],
})
export class CommentModule { }