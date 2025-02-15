import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Profile } from '../../profile/profile.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserCreateDto } from '../dto/req/user.create.dto';
import { UserLoginPayload } from '../dto/req/user.login.dto';
import { UpdateUserDto } from '../dto/req/user.update.dto';

jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
  }));

describe('UserService', () => {
    let userService: UserService;
    let userRepository: Repository<User>;
    let profileRepository: Repository<Profile>;
    let jwtService: JwtService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: getRepositoryToken(User),
            useClass: Repository,  // User 엔티티에 대한 mock repository 제공
          },
          {
            provide: getRepositoryToken(Profile),
            useClass: Repository,  // Profile 엔티티에 대한 mock repository 제공
          },
          {
            provide: JwtService,
            useValue: { sign: jest.fn().mockReturnValue('fake-jwt-token') },  // JWT 서비스 mock (토큰 생성)
          },
        ],
      }).compile();

      userService = module.get<UserService>(UserService);  // UserService 인스턴스 가져오기
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));  // UserRepository 인스턴스 가져오기
      profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));  // ProfileRepository 인스턴스 가져오기
      jwtService = module.get<JwtService>(JwtService);  // JwtService 인스턴스 가져오기
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

        const user = new User();
        user.email = userDto.email;
        user.password = await bcrypt.hash(userDto.password, 10);

        const profile = new Profile();
        profile.username = userDto.username;
        profile.user = user;

        // UserRepository와 ProfileRepository의 메서드를 mock 처리하여 테스트 준비
        jest.spyOn(userRepository, 'create').mockReturnValue(user);  // userRepository.create 호출 시 user 반환
        jest.spyOn(userRepository, 'save').mockResolvedValue(user);  // userRepository.save 호출 시 user 반환
        jest.spyOn(profileRepository, 'create').mockReturnValue(profile);  // profileRepository.create 호출 시 profile 반환
        jest.spyOn(profileRepository, 'save').mockResolvedValue(profile);  // profileRepository.save 호출 시 profile 반환

        const result = await userService.signUp(userDto);  // 가입 서비스 호출

        // 반환된 결과에 이메일과 토큰이 포함되어 있는지 확인
        expect(result).toHaveProperty('email', userDto.email);
        expect(result).toHaveProperty('token');
      });
    });

    describe('로그인', () => {
      it('사용자를 찾을 수 없으면 UnauthorizedException 예외 발생해야함', async () => {
        // 로그인 시 사용자를 찾을 수 없을 때 UnauthorizedException 발생 테스트
        const userLoginPayload: UserLoginPayload = {
          email: 'test@example.com',
          password: 'password',
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);  // 사용자 없음(mock 처리)

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

        const user = new User();
        user.email = userLoginPayload.email;
        user.password = await bcrypt.hash(userLoginPayload.password, 10);
        user.profile = new Profile();  // mock된 Profile 추가

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);  // 사용자 조회(mock 처리)

        const result = await userService.signIn(userLoginPayload);  // 로그인 서비스 호출

        // 반환된 결과에 이메일과 토큰이 포함되어 있는지 확인
        expect(result).toHaveProperty('email', userLoginPayload.email);
        expect(result).toHaveProperty('token');
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

        const user = new User();
        user.id = 1;
        user.email = 'test@example.com';
        user.password = await bcrypt.hash('oldpassword', 10);  // 기존 비밀번호
        user.profile = new Profile();
        user.profile.username = 'testuser';

        // UserRepository와 ProfileRepository의 메서드를 mock 처리하여 테스트 준비
        jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);  // findOneOrFail 호출 시 user 반환
        jest.spyOn(userRepository, 'save').mockResolvedValue(user);  // save 호출 시 user 반환
        jest.spyOn(profileRepository, 'save').mockResolvedValue(user.profile);  // profile 저장(mock 처리)

        const result = await userService.updateUser(1, updateUserDto);  // 사용자 업데이트 서비스 호출

        // 반환된 결과에 이메일과 토큰이 포함되어 있는지 확인
        expect(result).toHaveProperty('email', user.email);
        expect(result).toHaveProperty('token');
      });
    });
});
