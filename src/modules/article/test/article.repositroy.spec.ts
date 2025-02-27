import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";
import { TestModule } from "../../../../test/test.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { User } from "../../user/user.entity";
import { ArticleRepository } from "../article.repository";
import { Article } from "../article.entity";
import { Tag } from "../../tag/tag.entity";

describe('ArticleRepository', () => {
    let module: TestingModule;
    let repository: ArticleRepository;
    let userRepository: Repository<User>;
    let articleRepository: Repository<Article>
    let tagRepository: Repository<Tag>;

    let article: Article
    let user: User;

    async function clear() {
        await articleRepository.delete({});
        await tagRepository.delete({});
        await userRepository.delete({});
    }
    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [TestModule], // 실제 DB 연결을 위한 TestModule
        }).compile();

        repository = module.get<ArticleRepository>(ArticleRepository);
        tagRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));
        articleRepository = module.get<Repository<Article>>(getRepositoryToken(Article));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));

        user = await userRepository.save(userRepository.create({
            email: 'test@example.com',
            password: 'password'
        }));
        


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

    it('ArticleRepository가 정의되어 있어야 함', () => {
        expect(repository).toBeDefined();
    });

    it('addTags - 새로운 태그를 추가할 수 있어야 함', async () => {
        const tags = await repository.addTags(['nestjs', 'typeorm']);
        expect(tags).toHaveLength(2);
        expect(tags[0].name).toBe('nestjs');
        expect(tags[1].name).toBe('typeorm');
    });

    it('save - 게시글을 저장할 수 있어야 함', async () => {
        article = Article.builder()
        .setTitle('Test Article')
        .setSlug('test-article2')
        .setDescription('Test description') // 설명이 필요하다면 추가
        .setBody('This is a test article.')
        .setTags([]) // 태그가 필요하면 설정
        .setAuthor(user)
        .build();
        article = await repository.save(article);
        
        expect(article.id).toBeDefined();
    });

    it('findBySlug - Slug로 게시글을 조회할 수 있어야 함', async () => {
        const foundArticle = await repository.findBySlug('test-article');
        expect(foundArticle).toBeDefined();
        expect(foundArticle.slug).toBe('test-article');
    });

    it('findBySlug - 존재하지 않는 게시글 Slug 조회 시 예외 발생', async () => {
        await expect(repository.findBySlug('non-existent'))
            .rejects.toThrow(NotFoundException);
    });

    it('delete - 게시글 삭제 후 조회 시 예외 발생', async () => {
        await repository.delete(article);


        
        await expect(repository.findBySlug('test-article'))
            .rejects.toThrow(NotFoundException);
    });



});