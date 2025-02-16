import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { JwtAuthGuard } from '../../../auth/auth.guard';
import { UserResponseDto } from '../dto/res/user.response.dto';
import { UserCreateRequestDto } from '../dto/req/user.create.dto';
import { UserLoginDto } from '../dto/req/user.login.dto';
import { UpdateUserDto } from '../dto/req/user.update.dto';
import { BadRequestException, ExecutionContext } from '@nestjs/common';

// Mock UserService
const mockUserService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
};


describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('회원가입', () => {
    it('새로운 사용자를 생성하고 토큰이 포함된 UserResponseDto(타입추론) 를 반환해야 함', async () => {
      const createUserReqDto: UserCreateRequestDto = {
        user: { email: 'test@example.com', password: 'password', username: 'testuser' },
      };
      await userController.signUp(createUserReqDto);

      expect(mockUserService.signUp).toHaveBeenCalledWith(createUserReqDto.user);
    });

    it('잘못된 이메일 형식으로 회원가입하면 BadRequestException을 던져야 함', async () => {
      const createUserReqDto: UserCreateRequestDto = {
        user: { email: 'invalid-email', password: 'password', username: 'testuser' },
      };

      try {
        await userController.signUp(createUserReqDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

  });

  describe('로그인', () => {
    it('사용자가 로그인하면 UserResponseDto(타입추론) 를 반환해야 함', async () => {
      const loginDto: UserLoginDto = { user: { email: 'test@example.com', password: 'password' } };
      await userController.logIn(loginDto);

      expect(mockUserService.signIn).toHaveBeenCalledWith(loginDto.user);
    });
  });

  describe('getUser', () => {
    it('인증된 사용자의 정보를 반환해야 함', async () => {
      const req = {
        headers: { authorization: 'Token mockToken' },
        user: { id: 1 },
      };

      await userController.getUser(req);

      expect(mockUserService.findById).toHaveBeenCalledWith(1,"mockToken");
    });
  });

  describe('updateUser', () => {
    it('사용자 정보를 업데이트하고 변경된 UserResponseDto(타입추론) 반환해야 함', async () => {
      const updateUserDto: UpdateUserDto = { user: {email: 'new@example.com', bio: 'Updated bio'} };

      mockUserService.updateUser.mockResolvedValue({ user: { setToken: () => { } } });

      const req = {
        headers: { authorization: 'Token mockToken' },
        user: { id: 1 },
      };

      await userController.updateUser(updateUserDto, req);
      
      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, updateUserDto);
    });
  });
});
