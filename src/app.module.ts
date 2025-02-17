import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { WinstonLogger } from './config/logging/logger';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './middleware/flters/all-exception.filter';
import { ArticleModule } from './modules/article/article.module';
import { FollowModule } from './modules/follow/follow.module';
import { CommentModule } from './modules/comment/comment.module';



@Module({
  imports: [

    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: process.env.DBUSER,
        password: process.env.DBPW,
        database: 'realworld',
        synchronize: false,
        dropSchema: false,
        logging: true, // true로 설정하면 SQL 쿼리, 오류 등을 콘솔에 출력
        entities: [
           __dirname + "/modules/**/*.entity{.ts,.js}"
        ],
      }),
      inject: [],
    }),
    UserModule, 
    AuthModule,
    ArticleModule,
    FollowModule,
    // CommentModule,
  ],
  controllers: [AppController],
  providers: [AllExceptionsFilter,AppService,WinstonLogger],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    addTransactionalDataSource(dataSource);
  }
}
