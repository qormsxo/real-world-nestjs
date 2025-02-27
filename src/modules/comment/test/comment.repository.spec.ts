import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";
import { TestModule } from "../../../../test/test.module";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { User } from "../../user/user.entity";
import { Profile } from "../../profile/profile.entity";
import { CommentRepository } from "../comment.repository";
import { Comment } from "../comment.entity";
import { Article } from "../..//article/article.entity";

describe('CommentRepository', () => {
    let module: TestingModule;
    let repository: CommentRepository;
    let commentRepository: Repository<Comment>;
    let userRepository: Repository<User>;
    let profileRepository: Repository<Profile>;
    let articleRepository: Repository<Article>

    let article: Article
    let user: User;
    let profile: Profile;
    let comment: Comment;

    async function clear() {
        await articleRepository.delete({});
        await commentRepository.delete({});
        await profileRepository.delete({});
        await userRepository.delete({});
    }
    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [TestModule], // 실제 DB 연결을 위한 TestModule
        }).compile();

        repository = module.get<CommentRepository>(CommentRepository);
        commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
        articleRepository = module.get<Repository<Article>>(getRepositoryToken(Article)) 

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

        article = Article.builder()
        .setTitle('Test Article')
        .setSlug('test-article')
        .setDescription('Test description')
        .setBody('This is a test article body.')
        .setTags([])
        .setAuthor(user)
        .build();

        await articleRepository.save(article);

    });

    afterAll(async () => {
        await clear();
        await module.close();
    });

    it('CommentRepository가 정의되어 있어야 함', () => {
        expect(repository).toBeDefined();
    });

    it('댓글을 생성하고 저장할 수 있어야 함', async () => {
        const body = 'This is a test comment';

        // 댓글 생성
        comment = await repository.create(article, body, user);
        expect(comment).toBeDefined();
        expect(comment.body).toBe(body);
        expect(comment.article.id).toBe(article.id);
        expect(comment.user.id).toBe(user.id);

        // 댓글 저장
        comment = await repository.save(comment);
        expect(comment.id).toBeDefined();
    });

    it('id와 articleId를 이용해 댓글을 찾을 수 있어야 함', async () => {
        const foundComment = await repository.findArticlesComment(comment.id, article.id);

        expect(foundComment).toBeDefined();
        expect(foundComment?.id).toBe(comment.id);
        expect(foundComment?.user.id).toBe(user.id);
    });

    it('댓글을 삭제할 수 있어야 함', async () => {
        await repository.delete(comment);

        // 삭제 후 댓글이 존재하지 않는지 확인
        const deletedComment = await repository.findArticlesComment(comment.id, article.id);
        expect(deletedComment).toBeNull();
    });
    

});