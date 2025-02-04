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
        entities: [
           __dirname + "/modules/**/*.entity{.ts,.js}"
        ],
      }),
      inject: [],
    }),
    UserModule, 
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService,WinstonLogger],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    addTransactionalDataSource(dataSource);
  }
}
