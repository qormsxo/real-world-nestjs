import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { JwtAuthGuard } from '../../../auth/auth.guard';
import { UserResponseDto } from '../dto/res/user.response.dto';
import { UserCreateRequestDto } from '../dto/req/user.create.dto';
import { UserLoginDto } from '../dto/req/user.login.dto';
import { UpdateUserDto } from '../dto/req/user.update.dto';
import { ExecutionContext } from '@nestjs/common';

// Mock UserService
const mockUserService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
};

// Mock User Entity
const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  bio: 'Test bio',
  image: 'test.jpg',
  setToken: jest.fn(),
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
    })
      .overrideGuard(JwtAuthGuard) // JWT Guard를 Mock 처리
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: mockUser.id }; // Mock user 설정
          return true;
        },
      })
      .compile();

    userController = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('회원가입', () => {
    it('새로운 사용자를 생성하고 UserResponseDto를 반환해야 함', async () => {
      const createUserReqDto: UserCreateRequestDto = {
        user: { email: 'test@example.com', password: 'password', username: 'testuser' },
      };

      mockUserService.signUp.mockResolvedValue(mockUser);

      const result = await userController.signUp(createUserReqDto);

      expect(mockUserService.signUp).toHaveBeenCalledWith(createUserReqDto.user);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user.email).toEqual('test@example.com');
    });
  });

  describe('로그인', () => {
    it('사용자가 로그인하면 UserResponseDto를 반환해야 함', async () => {
      const loginDto: UserLoginDto = { user: { email: 'test@example.com', password: 'password' } };

      mockUserService.signIn.mockResolvedValue(mockUser);

      const result = await userController.logIn(loginDto);

      expect(mockUserService.signIn).toHaveBeenCalledWith(loginDto.user);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user.username).toEqual('testuser');
    });
  });

  describe('getUser', () => {
    it('인증된 사용자의 정보를 반환해야 함', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const req = {
        headers: { authorization: 'Bearer mockToken' },
        user: { id: 1 },
      };

      const result = await userController.getUser(req);

      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user.username).toEqual("testuser");
      expect(mockUser.setToken).toHaveBeenCalledWith('mockToken');
    });
  });

  describe('updateUser', () => {
    it('사용자 정보를 업데이트하고 변경된 UserResponseDto를 반환해야 함', async () => {
      const updateUserDto: UpdateUserDto = { user: {email: 'new@example.com', bio: 'Updated bio'} };
      
      const updatedUser = { ...mockUser }; 
      Object.assign(updatedUser, updateUserDto.user);

      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const req = {
        headers: { authorization: 'Bearer mockToken' },
        user: { id: 1 },
      };

      const result = await userController.updateUser(updateUserDto, req);
      

      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.user.email).toEqual('new@example.com');
      expect(result.user.bio).toEqual('Updated bio');
      expect(mockUser.setToken).toHaveBeenCalledWith('mockToken');
    });
  });
});
