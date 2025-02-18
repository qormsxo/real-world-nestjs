import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../user.entity";
import { Repository } from "typeorm";
import { TestModule } from "../../../../test/test.module";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../user.repository";

describe('userService', () => {
    let module: TestingModule;
    let userRepository: Repository<User>;
    let repository: UserRepository;

    const email = 'user@example.com';
    const password = 'password';
    let user: User;

    async function clear() {
        await userRepository.delete({});  // User 테이블의 모든 데이터 삭제
    }
    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TestModule,
            ],
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
        userRepository = module.get(getRepositoryToken(User));

        // 미리 사용자 데이터를 저장
        user = new User();
        user.email = email;
        user.password = password;
        await repository.save(user);  // 데이터베이스에 사용자 저장
    });

    afterAll(async () => {
        await clear();
        await module.close();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findByEmail', () => {
        it('사용자를 찾을 수 없으면 UnauthorizedException을 던져야 함', async () => {
            const nonexistentEmail = 'nonexistent@example.com';

            try {
                await repository.findByEmail(nonexistentEmail);
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('이메일이 올바르지 않습니다.');
            }
        });

        it('사용자를 찾으면 정상적으로 반환해야 함', async () => {
            const result = await repository.findByEmail(email);

            expect(result.email).toBe(email);
            expect(result.password).toBe(password);
        });
    });

    describe('findById', () => {
        it('사용자를 찾을 수 없으면 NotFoundException을 던져야 함', async () => {
            const id = 999;

            try {
                await repository.findById(id);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toBe('유저를 찾을 수 없습니다.');
            }
        });

        it('사용자를 찾으면 정상적으로 반환해야 함', async () => {
            const result = await repository.findById(user.id);

            expect(result.id).toBe(user.id);
            expect(result.email).toBe(email);
            expect(result.password).toBe(password);
        });
    });

    describe('create and save', () => {
        it('사용자 생성이 정상적으로 이루어져야 함', async () => {
            const newEmail = 'newuser@example.com';
            const newPassword = 'newPassword';

            const createdUser = await repository.create(newEmail, newPassword);

            expect(createdUser.email).toBe(newEmail);
            expect(createdUser.password).toBe(newPassword);
        });

        it('사용자 데이터가 정상적으로 저장되어야 함', async () => {
            const newUser = new User();
            newUser.email = 'anotheruser@example.com';
            newUser.password = 'anotherPassword';

            const result = await repository.save(newUser);

            expect(result.email).toBe(newUser.email);
            expect(result.password).toBe(newUser.password);

            // 저장된 데이터가 DB에 있는지 확인
            const savedUser = await userRepository.findOneOrFail({ where: { email: newUser.email } });
            expect(savedUser).toBeDefined();
            expect(savedUser.email).toBe(newUser.email);
        });
    });
});