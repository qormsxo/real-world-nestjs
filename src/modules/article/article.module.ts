import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Tag } from '../tag/tag.entity';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { User } from '../user/user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Article,Tag,User]),
  ],
  providers: [ArticleService], 
  controllers: [ArticleController],
})
export class ArticleModule {}