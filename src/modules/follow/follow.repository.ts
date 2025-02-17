import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Follow } from './follow.entity';
import { Profile } from '../profile/profile.entity';

@Injectable()
export class FollowRepository {
    constructor(

        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,
    ) {}

    async isFollow(follower:User,profile:Profile):Promise<boolean>{
        const follow = await this.followRepository.findOne({
            where: { follower, following: profile },
        });
        return follow ? true : false; 
    }

    async findByUserAndProfile(follower: User, profile: Profile): Promise<Follow> {
        // 팔로우 관계 확인
        return await this.followRepository.findOne({
            where: { follower, following: profile },
        })
            || (() => { throw new NotFoundException('팔로우하지 않은 유저입니다.'); })()

    }

    async create(follower:User,following:Profile){
        return this.followRepository.create({
            follower,
            following: following,
        });
    }
    async save(follow:Follow): Promise<Follow>{
        return await this.followRepository.save(follow)
    }

    async delete(follow:Follow){
        // 언팔로우 follow 테이블에서 삭제
        await this.followRepository.remove(follow);
    }

    // 팔로우 하고 있는 사람 조회 
    async findFollowingUser(followerId:number){
        return await this.followRepository.find({
            where: { follower: { id: followerId } },
            relations: ['following.user'],
        })
    }


}
