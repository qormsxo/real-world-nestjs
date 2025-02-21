import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";
import { TestModule } from "../../../../test/test.module";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Follow } from "../follow.entity";
import { FollowRepository } from "../follow.repository";
import { User } from "../../user/user.entity";
import { Profile } from "../../profile/profile.entity";

describe('FollowRepository', () => {
    let module: TestingModule;
    let repository: FollowRepository;
    let followRepository: Repository<Follow>;
    let userRepository: Repository<User>;
    let profileRepository: Repository<Profile>;

    let user: User;
    let profile: Profile;
    let follow: Follow;

    async function clear() {
        await followRepository.delete({});  // Follow 테이블의 모든 데이터 삭제
        await profileRepository.delete({}); // Profile 테이블의 모든 데이터 삭제
        await userRepository.delete({});  // User 테이블의 모든 데이터 삭제
    }
    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [TestModule], // 실제 DB 연결을 위한 TestModule
        }).compile();

        repository = module.get<FollowRepository>(FollowRepository);
        followRepository = module.get<Repository<Follow>>(getRepositoryToken(Follow));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));

        // 사용자와 프로필을 DB에 저장
        user = userRepository.create({
            email: 'user@example.com',
            password: 'password',
        });
        await userRepository.save(user);

        profile = profileRepository.create({
            username: 'testUser',
        });

        
        profile = await profileRepository.save(profile);

        // 팔로우 관계 저장
        follow = followRepository.create({
            follower: user,
            following: profile,
        });
        await followRepository.save(follow);
    });

    afterAll(async () => {
        await clear();
        await module.close();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        it('새로운 팔로우 관계가 정상적으로 생성되어야 함', async () => {
          const newFollow = await repository.create(user, profile);
          expect(newFollow.follower.id).toBe(user.id);
          expect(newFollow.following.id).toBe(profile.id);
        });
      });
    
      describe('findByUserAndProfile', () => {
        it('팔로우 관계를 찾을 수 있어야 함', async () => {
          const result = await repository.findByUserAndProfile(user, profile);
          
          expect(result.follower.email).toBe(user.email);
        });
    
        it('팔로우 관계가 없으면 NotFoundException 예외 발생', async () => {
          const nonexistentUser = new User();
          nonexistentUser.id = 999;
    
          try {
            await repository.findByUserAndProfile(nonexistentUser, profile);
          } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toBe('팔로우하지 않은 유저입니다.');
          }
        });
      });

      describe('findFollowingUser', () => {
        it('팔로우하고 있는 사용자 목록을 조회해야 함', async () => {
          const followingUsers = await repository.findFollowingUser(user.id);
          
          expect(followingUsers).toHaveLength(1);
          expect(followingUsers[0].following.username).toBe(profile.username);
        });
      });
    
      describe('delete', () => {
        it('팔로우 관계가 정상적으로 삭제되어야 함', async () => {
          await repository.delete(follow);
          try {
            await repository.findByUserAndProfile(user, profile);
          } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
          }
        });
      });
    


});