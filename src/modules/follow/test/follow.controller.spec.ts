import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { FollowController } from '../follow.controller';
import { FollowService } from '../follow.service';

// Mock UserService
const mockUserService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
};


describe('followController', () => {
  let followController: FollowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        {
          provide: FollowService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    followController = module.get<FollowController>(FollowController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(followController).toBeDefined();
  });

});
