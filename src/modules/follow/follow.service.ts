import { ConflictException, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { ProfileResponseDto, ProfileWrapperDto } from '../profile/dto/res/profile.response.dto';
import { FollowRepository } from './follow.repository';
import { ProfileRepository } from '../profile/profile.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class FollowService {
    constructor(

        private followRepository: FollowRepository,

        private readonly profileRepository: ProfileRepository,

        private readonly userRepository: UserRepository,
    ) { }

    @Transactional()
    async follow(username: string, id: number): Promise<ProfileWrapperDto> {
        const profile = await this.profileRepository.getProfileWithFollowers(username);
        const follower = await this.userRepository.findById(id);

        if (await this.followRepository.isFollow(follower, profile)) {
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
        const profile = await this.profileRepository.getProfileWithFollowers(username);
        const follower = await this.userRepository.findById(id);

        // 팔로우 관계 확인
        const follow = await this.followRepository.findByUserAndProfile(follower, profile)


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
        const profile = await this.profileRepository.getProfileWithFollowers(username);

        return {
            profile: ProfileResponseDto.toDto(profile, id),
        };
    }

}
