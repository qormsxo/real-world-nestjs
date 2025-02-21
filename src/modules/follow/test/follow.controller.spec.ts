import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { FollowController } from '../follow.controller';
import { FollowService } from '../follow.service';
import { ProfileWrapperDto } from 'src/modules/profile/dto/res/profile.response.dto';

  // FollowService의 mock 객체
  const mockFollowService = {
    follow: jest.fn(),
    unfollow: jest.fn(),
    getProfile: jest.fn(),
  };

describe('followController', () => {
  let followController: FollowController;
  let followService: FollowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        {
          provide: FollowService,
          useValue: mockFollowService,
        },
      ],
    }).compile();

    followController = module.get<FollowController>(FollowController);
    followService = module.get<FollowService>(FollowService);
  });

    // 테스트에 사용할 가짜 프로필 데이터
    const fakeProfile: ProfileWrapperDto = {
      profile: {
        username: 'testUser',
        bio: 'This is a test bio',
        image: 'http://test.image/url',
        following: true,
      },
    };
  

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(followController).toBeDefined();
  });

  describe('follow', () => {
    it('followService.follow를 호출하고 프로필을 반환해야 함', async () => {
      const username = 'testUser';
      const req = { user: { id: 1 } };

      mockFollowService.follow.mockResolvedValue(fakeProfile);

      const result = await followController.follow(username, req);

      expect(followService.follow).toHaveBeenCalledWith(username, req.user.id);
      expect(result).toEqual(fakeProfile);
    });
  });

  describe('unFollow', () => {
    it('followService.unfollow를 호출하고 프로필을 반환해야 함', async () => {
      const username = 'testUser';
      const req = { user: { id: 1 } };

      mockFollowService.unfollow.mockResolvedValue(fakeProfile);

      const result = await followController.unFollow(username, req);

      expect(followService.unfollow).toHaveBeenCalledWith(username, req.user.id);
      expect(result).toEqual(fakeProfile);
    });
  });

  describe('getProfile', () => {
    it('followService.getProfile을 호출하고 프로필을 반환해야 함', async () => {
      const username = 'testUser';
      const req = { user: { id: 1 } };

      mockFollowService.getProfile.mockResolvedValue(fakeProfile);

      const result = await followController.getProfile(username, req);

      expect(followService.getProfile).toHaveBeenCalledWith(username, req.user.id);
      expect(result).toEqual(fakeProfile);
    });
  });

});
