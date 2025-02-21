import { Test, TestingModule } from '@nestjs/testing';
import { Profile } from '../../profile/profile.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ProfileRepository } from '../../profile/profile.repository';
import { FollowService } from '../follow.service';
import { FollowRepository } from '../follow.repository';
import { UserRepository } from '../../user/user.repository';
import { User } from '../../user/user.entity';
import { Follow } from '../follow.entity';

jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));

describe('FollowService', () => {
    let followService: FollowService;

    let followRepository: FollowRepository;
    let profileRepository: ProfileRepository;
    let userRepository: UserRepository;

    let profile: Profile;
    let follower: User;
    let follow: Follow;

    beforeEach(async () => {

        // Profile, User, Follow 엔티티 공통 정의
        profile = new Profile();
        profile.username = 'testUser';
        profile.followers = [];  // 빈 배열로 설정

        follower = new User();
        follower.id = 1;
        follower.email = 'test@user.com';
        follower.password = 'password';

        follow = new Follow();
        follow.id = 1;
        follow.follower = follower;
        follow.following = profile;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FollowService,
                {
                    provide: FollowRepository,
                    useValue: {
                        findByEmail: jest.fn(),
                        findById: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        isFollow: jest.fn(),  // 필요한 메소드 추가
                        findByUserAndProfile: jest.fn(), // 언팔로우 테스트를 위해 추가
                        delete: jest.fn(), // 언팔로우 시 사용
                    },
                },
                {
                    provide: ProfileRepository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        getProfileWithFollowers: jest.fn().mockResolvedValue(new Profile()), // mockResolvedValue 설정
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        findById: jest.fn(),
                    },  // JWT 서비스 mock (토큰 생성)
                },
            ],
        }).compile();

        followService = module.get<FollowService>(FollowService);
        userRepository = module.get<UserRepository>(UserRepository);
        followRepository = module.get<FollowRepository>(FollowRepository);
        profileRepository = module.get<ProfileRepository>(ProfileRepository);

    });

    it('should be defined', () => {
        // UserService가 잘 정의되어 있는지 확인하는 기본 테스트
        expect(followService).toBeDefined();
    });

    describe('follow', () => {
        it('사용자가 특정 프로필을 팔로우할 수 있어야 함', async () => {
            
            jest.spyOn(profileRepository, 'getProfileWithFollowers').mockResolvedValue(profile);
            jest.spyOn(userRepository, 'findById').mockResolvedValue(follower);
            jest.spyOn(followRepository, 'isFollow').mockResolvedValue(false);
            jest.spyOn(followRepository, 'create').mockResolvedValue(follow);
            jest.spyOn(followRepository, 'save').mockResolvedValue(follow);

            const result = await followService.follow(profile.username, follower.id);

            expect(result).toHaveProperty('profile');
            expect(followRepository.save).toHaveBeenCalledWith(follow);
            expect(profileRepository.save).toHaveBeenCalledWith(profile);
        });

        it('이미 팔로우한 경우 ConflictException이 발생해야 함', async () => {
            jest.spyOn(userRepository, 'findById').mockResolvedValue(follower);
            jest.spyOn(followRepository, 'isFollow').mockResolvedValue(true);

            try {
                await followService.follow(profile.username, follower.id);
            } catch (error) {
                expect(error).toBeInstanceOf(ConflictException);
            }
        });
    });

    describe('unfollow', () => {
        it('사용자가 특정 프로필의 팔로우를 취소할 수 있어야 함', async () => {
            profile.followers = [follow];
            jest.spyOn(profileRepository, 'getProfileWithFollowers').mockResolvedValue(profile);
            jest.spyOn(userRepository, 'findById').mockResolvedValue(follower);
            jest.spyOn(followRepository, 'findByUserAndProfile').mockResolvedValue(follow);
            jest.spyOn(followRepository, 'delete').mockImplementation(async () => {});

            jest.spyOn(profileRepository, 'save').mockResolvedValue(profile);

            const result = await followService.unfollow(profile.username, follower.id);

            expect(followRepository.delete).toHaveBeenCalledWith(follow);
            expect(profileRepository.save).toHaveBeenCalled();
            expect(result).toHaveProperty('profile');
        });
    });

    describe('getProfile', () => {
        it('사용자가 특정 프로필을 조회할 수 있어야 함', async () => {
            jest.spyOn(profileRepository, 'getProfileWithFollowers').mockResolvedValue(profile);

            const result = await followService.getProfile(profile.username, follower.id);

            expect(result).toHaveProperty('profile');
            expect(profileRepository.getProfileWithFollowers).toHaveBeenCalledWith(profile.username);
        });
    });
});
