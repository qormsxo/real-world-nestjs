import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Follow } from './follow.entity';
import { Profile } from '../profile/profile.entity';
import { User } from '../user/user.entity';
import { ProfileResponseDto, ProfileWrapperDto } from '../profile/dto/res/profile.response.dto';
import { FollowRepository } from './follow.repository';

@Injectable()
export class FollowService {
    constructor(

        private followRepository: FollowRepository,

        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    private async getProfileWithFollowers(username: string): Promise<Profile> {
        return await this.profileRepository.findOne({
            where: { username },
            relations: ['followers'],
        }) || (() => { throw new NotFoundException('프로필을 찾을 수 없습니다.') })();
    }

    private async getUserById(id: number): Promise<User> {
        return await this.userRepository.findOne({ where: { id } })
            || (() => { throw new NotFoundException('존재하지 않는 유저') })();
    }

    @Transactional()
    async follow(username: string, id: number): Promise<ProfileWrapperDto> {
        const profile = await this.getProfileWithFollowers(username);
        const follower = await this.getUserById(id);

        if (await this.followRepository.isFollow(follower,profile)) {
            throw new ConflictException('이미 팔로우 한 유저입니다.');
        }

        // 팔로우 생성 및 저장
        const follow = await this.followRepository.create(
            follower,
            profile,
        );
        
        await this.followRepository.save(follow)

        // 프로필에 팔로우를 수동으로 추가하고 갱신
        profile.followers.push(follow);
        await this.profileRepository.save(profile);

        return {
            profile: ProfileResponseDto.toDto(profile, id),
        };
    }


    @Transactional()
    async unfollow(username: string, id: number): Promise<ProfileWrapperDto> {
        const profile = await this.getProfileWithFollowers(username);
        const follower = await this.getUserById(id);

        // 팔로우 관계 확인
        const follow = await this.followRepository.findByUserAndProfile(follower,profile)


        // 언팔로우 follow 테이블에서 삭제
        await this.followRepository.delete(follow);

        // 프로필에서 팔로워 제거 후 저장
        profile.followers = profile.followers.filter(f => f.follower.id !== id);
        await this.profileRepository.save(profile);

        return {
            profile: ProfileResponseDto.toDto(profile, id),
        };
    }

    async getProfile(username: string, id: number): Promise<ProfileWrapperDto> {
        const profile = await this.getProfileWithFollowers(username);

        return {
            profile: ProfileResponseDto.toDto(profile, id),
        };
    }
    
}
