import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { Profile } from '../../profile/profile.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserCreateDto } from '../dto/req/user.create.dto';
import { UserLoginPayload } from '../dto/req/user.login.dto';
import { UpdateUserDto } from '../dto/req/user.update.dto';
import { UserRepository } from '../user.repository';
import { ProfileRepository } from '../../profile/profile.repository';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let profileRepository: ProfileRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
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
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('fake-jwt-token') },  // JWT 서비스 mock (토큰 생성)
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);  // UserRepository 주입
    profileRepository = module.get<ProfileRepository>(ProfileRepository);

  });

  it('should be defined', () => {
    // UserService가 잘 정의되어 있는지 확인하는 기본 테스트
    expect(userService).toBeDefined();
  });

  describe('회원 가입', () => {
    it('사용자가 생성되고 토큰을 반환해야 함', async () => {
      // 사용자 가입 테스트
      const userDto: UserCreateDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
      };

      const testUser = new User();
      testUser.email = userDto.email;
      testUser.password = await bcrypt.hash(userDto.password, 10);

      const profile = new Profile();
      profile.username = userDto.username;
      profile.user = testUser;

      jest.spyOn(userRepository, 'create').mockResolvedValue(testUser); 

      testUser.id = 1

      jest.spyOn(userRepository, 'save').mockResolvedValue(testUser);
      jest.spyOn(profileRepository, 'create').mockResolvedValue(profile);

      const { user } = await userService.signUp(userDto);  // 가입 서비스 호출

      // 반환된 결과에 이메일과 토큰이 포함되어 있는지 확인
      expect(user).toHaveProperty('email', userDto.email);
      expect(user).toHaveProperty('token');
    });
  });

  describe('로그인', () => {
    it('사용자를 찾을 수 없으면 UnauthorizedException 예외 발생해야함', async () => {
      // 로그인 시 사용자를 찾을 수 없을 때 UnauthorizedException 발생 테스트
      const userLoginPayload: UserLoginPayload = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(userRepository, 'findByEmail').mockRejectedValue(new UnauthorizedException('이메일이 올바르지 않습니다.'));  // 사용자 없음(mock 처리)

      try {
        await userService.signIn(userLoginPayload);  // 로그인 서비스 호출
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);  // UnauthorizedException 확인
      }
    });

    it('로그인 성공 시 사용자 정보와 토큰을 반환해야 함', async () => {
      // 로그인 시 정상적으로 사용자 정보를 반환하고 토큰을 생성하는지 테스트
      const userLoginPayload: UserLoginPayload = {
        email: 'test@example.com',
        password: 'password',
      };

      const testUser = new User();
      testUser.email = userLoginPayload.email;
      testUser.password = await bcrypt.hash(userLoginPayload.password, 10);
      testUser.profile = new Profile();  // mock된 Profile 추가

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser);  // 사용자 조회(mock 처리)

      const { user } = await userService.signIn(userLoginPayload);  // 가입 서비스 호출

      // 반환된 결과에 이메일과 토큰이 포함되어 있는지 확인
      expect(user).toHaveProperty('email', userLoginPayload.email);
      expect(user).toHaveProperty('token');
    });
  });

  describe('사용자 정보 업데이트', () => {
    it('사용자 정보를 업데이트하고 업데이트된 사용자 정보와 토큰을 반환해야 함', async () => {
      // 사용자 정보 업데이트 및 변경된 정보 반환 테스트
      const updateUserDto: UpdateUserDto = {
        user: {
          password: 'newpassword',  // 비밀번호 변경
        },
      };

      const testUser = new User();
      testUser.id = 1;
      testUser.email = 'test@example.com';
      testUser.password = await bcrypt.hash('oldpassword', 10);  // 기존 비밀번호
      testUser.profile = new Profile();
      testUser.profile.username = 'testuser';

      // UserRepository와 ProfileRepository의 메서드를 mock 처리하여 테스트 준비
      jest.spyOn(userRepository, 'findById').mockResolvedValue(testUser);  // findOneOrFail 호출 시 user 반환
      jest.spyOn(userRepository, 'save').mockResolvedValue(testUser);  // save 호출 시 user 반환
      jest.spyOn(profileRepository, 'save').mockResolvedValue(testUser.profile);  // profile 저장(mock 처리)

      const { user } = await userService.updateUser(1, updateUserDto);  // 사용자 업데이트 서비스 호출

      // 반환된 결과에 이메일과 토큰이 포함되어 있는지 확인
      expect(user).toHaveProperty('email', user.email);
      expect(user).toHaveProperty('token');
    });
  });
});
