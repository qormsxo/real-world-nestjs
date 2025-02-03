import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { typeOrmConfig } from './database/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';


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
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    addTransactionalDataSource(dataSource);
  }
}
