import { Test, TestingModule } from "@nestjs/testing";
import { Profile } from "../profile.entity";
import { Repository } from "typeorm";
import { TestModule } from "../../../../test/test.module";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { ProfileRepository } from "../profile.repository";
import { User } from "../../user/user.entity";


describe('userService', () => {
    let module: TestingModule;
    let profileRepository: Repository<Profile>;
    let userRepository: Repository<User>
    let repository: ProfileRepository;


    const email = 'user@example.com';
    const password = 'password';
    let user: User;


    let profile: Profile;

    async function clear() {
        await profileRepository.delete({});
        await userRepository.delete({});
    }
    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TestModule,
            ],
        }).compile();

        repository = module.get<ProfileRepository>(ProfileRepository);
        profileRepository = module.get(getRepositoryToken(Profile));
        userRepository = module.get(getRepositoryToken(User));
        // 테스트용 유저 생성 및 저장
        user = new User();
        user.email = email;
        user.password = password;
        user = await userRepository.save(user);

        // 테스트용 프로필 생성 및 저장
        profile = new Profile();
        profile.username = 'testuser';
        profile.user = user;
        profile.followers = [];
        profile = await profileRepository.save(profile);
    });

    afterAll(async () => {
        await clear();
        await module.close();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('getProfileWithFollowers', () => {
        it('프로필을 찾으면 반환해야 함', async () => {

            const profile = await repository.getProfileWithFollowers('testuser');
            expect(profile.username).toBe('testuser');
        });

        it('프로필이 없으면 NotFoundException 발생해야 함', async () => {

            await expect(
                repository.getProfileWithFollowers('unknownuser')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('새로운 프로필을 생성해야 함', async () => {

            const createdProfile = await repository.create('newuser', user);
            expect(createdProfile.username).toBe('newuser');
            expect(createdProfile.user.id).toBe(user.id);
        });
    });

    describe('save', () => {
        it('프로필을 저장하고 반환해야 함', async () => {
            const newProfile = new Profile();
            newProfile.username = "223"

            const savedProfile = await profileRepository.save(newProfile);
            expect(savedProfile.username).toBe('223');
        });
    });



});