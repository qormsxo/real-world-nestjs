// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Article } from 'src/modules/article/article.entity';
import { Comment } from 'src/modules/comment/comment.entity';
import { Profile } from 'src/modules/profile/profile.entity';
import { Tag } from 'src/modules/tag/tag.entity';
import { User } from 'src/modules/user/user.entity';
import * as dotenv from 'dotenv';
dotenv.config(); // 환경 변수 로드

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: process.env.DBUSER,
  password: process.env.DBPW,
  database: 'realworld',
  entities: [User, Profile,Article,Comment,Tag],
  synchronize: false, 
};
