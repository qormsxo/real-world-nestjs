import { Test, TestingModule } from '@nestjs/testing';
import { Profile } from '../../profile/profile.entity';
import { UnauthorizedException } from '@nestjs/common';
import { ProfileRepository } from '../../profile/profile.repository';
import { FollowService } from '../follow.service';
import { FollowRepository } from '../follow.repository';
import { UserRepository } from '../../user/user.repository';

jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));

describe('FollowService', () => {
    let followService: FollowService;

    let followRepository: FollowRepository;
    let profileRepository: ProfileRepository;
    let userRepository: UserRepository;

    beforeEach(async () => {
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
                    },
                },
                {
                    provide: ProfileRepository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
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
FollowService
        followService = module.get<FollowService>(FollowService);
        userRepository = module.get<UserRepository>(UserRepository); 
        followRepository = module.get<FollowRepository>(FollowRepository); 
        profileRepository = module.get<ProfileRepository>(ProfileRepository);

    });

    it('should be defined', () => {
        // UserService가 잘 정의되어 있는지 확인하는 기본 테스트
        expect(followService).toBeDefined();
    });

});
