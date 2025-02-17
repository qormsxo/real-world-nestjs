import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Follow } from './follow.entity';
import { Profile } from '../profile/profile.entity';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { User } from '../user/user.entity';
import { FollowRepository } from './follow.repository';


@Module({
  imports: [
    TypeOrmModule.forFeature([Follow,Profile,User]),
  ],
  providers: [FollowService,FollowRepository], 
  controllers: [FollowController],
  exports:[FollowRepository]
})
export class FollowModule {}