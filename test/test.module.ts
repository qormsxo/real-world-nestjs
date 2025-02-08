import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "../src/modules/article/article.entity";
import { Profile } from "../src/modules/profile/profile.entity";
import { Tag } from "../src/modules/tag/tag.entity";
import { User } from "../src/modules/user/user.entity";
import { UserModule } from "../src/modules/user/user.module";
import { Comment } from "../src/modules/comment/comment.entity";
import { Follow } from "../src/modules/follow/follow.entity";
import { Favorite } from "../src/modules/favorite/favorite.entity";

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
        UserModule
    ],
})
export class TestModule { }