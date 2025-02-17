import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import * as dotenv from 'dotenv';
import { Comment } from '../comment/comment.entity';
import { Article } from '../article/article.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { ArticleModule } from '../article/article.module';
import { Tag } from '../tag/tag.entity';
import { Follow } from '../follow/follow.entity';
import { Favorite } from '../favorite/favorite.entity';
import { CommentRepository } from './comment.repository';


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment,Article,User,Tag,Follow, Favorite]),
    ArticleModule
  ],
  providers: [CommentService,CommentRepository],
  controllers: [CommentController],
})
export class CommentModule { }