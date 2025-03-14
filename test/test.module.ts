import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "../src/modules/article/article.entity";
import { Profile } from "../src/modules/profile/profile.entity";
import { Tag } from "../src/modules/tag/tag.entity";
import { User } from "../src/modules/user/user.entity";
import { Comment } from "../src/modules/comment/comment.entity";
import { Follow } from "../src/modules/follow/follow.entity";
import { Favorite } from "../src/modules/favorite/favorite.entity";
import * as dotenv from 'dotenv';
import { UserRepository } from "../src/modules/user/user.repository";
import { ProfileRepository } from "../src/modules/profile/profile.repository";
import { FollowRepository } from "../src/modules/follow/follow.repository";
import { CommentRepository } from "../src/modules/comment/comment.repository";
import { ArticleRepository } from "../src/modules/article/article.repository";
dotenv.config();  // .env 파일을 로드하여 process.env에 환경 변수 추가

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: process.env.DBUSER,
            password: process.env.DBPW,
            database: 'test',
            entities: [User, Profile, Article, Comment, Tag, Follow, Favorite],
            synchronize: true,
            dropSchema: true,
            // logging: true,
        }),
        TypeOrmModule.forFeature([Article, User, Tag, Profile, Follow, Favorite, Comment]),

    ],
    providers: [UserRepository,ProfileRepository,FollowRepository,CommentRepository,ArticleRepository]
})
export class TestModule { }