import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../user.entity";
import { Repository } from "typeorm";
import { TestModule } from "../../../../test/test.module";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { Profile } from "../../profile/profile.entity";
import { UserService } from "../user.service";
import { JwtModule } from "@nestjs/jwt";
import { UserCreateDto } from "../dto/req/user.create.dto";
import { UserLoginPayload } from "../dto/req/user.login.dto";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
  }));


describe('userService', () => {
    let module: TestingModule;
    let userRepository: Repository<User>;
    let profileRepository: Repository<Profile>
    let service: UserService;

    async function clear() {
        await profileRepository.delete({});  // Profile 테이블의 모든 데이터 삭제
        await userRepository.delete({});  // User 테이블의 모든 데이터 삭제
    }
    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: process.env.JWT_SECRET || 'yourSecretKey',  // JWT_SECRET이 없으면 기본값으로 'yourSecretKey' 사용
                    signOptions: { expiresIn: '1h' },  // 1시간 후 만료
                }),
                TestModule,
                TypeOrmModule.forFeature([User, Profile]),
            ],
            providers: [UserService],
        }).compile();

        service = module.get<UserService>(UserService);
        profileRepository = module.get(getRepositoryToken(Profile));
        userRepository = module.get(getRepositoryToken(User));
    });

    beforeEach(async () => {


    });

    afterEach(async () => {
    });

    afterAll(async () => {
        await clear();
        await module.close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('회원 가입', () => {
        it('사용자가 생성되고 토큰을 반환해야 함', async () => {
            const userDto: UserCreateDto = {
                email: 'test@example.com',
                password: 'password',
                username: 'testuser',
            };
    
            const { user } = await service.signUp(userDto);
    
            expect(user).toHaveProperty('email', userDto.email);
            expect(user).toHaveProperty('token');
    
            // 실제 DB에 데이터가 삽입되었는지 확인
            const userInDb = await userRepository.findOneOrFail({ where: { email: userDto.email } })

            expect(await bcrypt.compare(userDto.password, userInDb.password)).toBe(true);
            expect(userInDb).toBeDefined();
        });
    });
    
    describe('로그인', () => {
        it('사용자를 찾을 수 없으면 UnauthorizedException 예외 발생해야함', async () => {
            const userLoginPayload: UserLoginPayload = {
                email: 'noneUser@example.com',
                password: 'password',
            };
    
            try {
                await service.signIn(userLoginPayload);
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
            }
        });
    
        it('로그인 성공 시 사용자 정보와 토큰을 반환해야 함', async () => {
            const userLoginPayload: UserLoginPayload = {
                email: 'test@example.com',
                password: 'password',
            };
    
            const { user } = await service.signIn(userLoginPayload);
            
            expect(user).toHaveProperty('email', userLoginPayload.email);
            expect(user).toHaveProperty('token');
        });
    });
    
    describe('사용자 정보 업데이트', () => {
        it('사용자 정보를 업데이트하고 업데이트된 사용자 정보와 토큰을 반환해야 함', async () => {
            let newpassword = "newpassword";
            const updateUserDto = {
                user: {
                    password: newpassword,  // 비밀번호 변경
                    bio:"testbio",
                    image: "testimage",
                },
            };
            
            const { user } = await service.updateUser(1, updateUserDto);
    
            expect(user).toHaveProperty('email', "test@example.com");
            expect(user).toHaveProperty('token');
    
            // DB에서  업데이트 여부 확인
            const updatedUser = await userRepository.findOneOrFail({ where: { id: 1 } })
            
            
            expect(await bcrypt.compare(newpassword, updatedUser.password)).toBe(true);
        });
    });
    
})