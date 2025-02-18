import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Tag } from '../tag/tag.entity';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { User } from '../user/user.entity';
import * as dotenv from 'dotenv';
import { Follow } from '../follow/follow.entity';
import { Favorite } from '../favorite/favorite.entity';
import { ArticleRepository } from './article.repository';
import { FollowRepository } from '../follow/follow.repository';
import { UserRepository } from '../user/user.repository';
import { FavoriteRepository } from '../favorite/favorite.repository';
dotenv.config();  // .env 파일을 로드하여 process.env에 환경 변수 추가


@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, User, Follow, Favorite]),

  ],
  providers: [ArticleService, ArticleRepository, FollowRepository, UserRepository,FavoriteRepository],
  controllers: [ArticleController],
  exports: [ArticleService, ArticleRepository]
})
export class ArticleModule { }