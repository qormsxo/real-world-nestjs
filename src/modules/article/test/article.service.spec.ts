import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ArticleRepository } from "../article.repository";
import { Article } from "../article.entity";
import { User } from "../../user/user.entity";
import { ArticleService } from "../article.service";
import { UserRepository } from "../../user/user.repository";
import { FollowRepository } from "../../follow/follow.repository";
import { FavoriteRepository } from "../../favorite/favorite.repository";
import { ArticleCreateRequestBodyDto } from "../dto/req/article.create.dto";
import { Tag } from "../../tag/tag.entity";
import { Profile } from "../../profile/profile.entity";

jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));

describe('ArticleRepository', () => {
    let articleService: ArticleService;
    let articleRepository: jest.Mocked<ArticleRepository>;
    let userRepository: jest.Mocked<UserRepository>;
    let followRepository: jest.Mocked<FollowRepository>;
    let favoriteRepository: jest.Mocked<FavoriteRepository>;

    let user: User;
    let profile: Profile;
    let article: Article;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticleService,
                {
                    provide: ArticleRepository,
                    useValue: {
                        save: jest.fn(),
                        findArticleBySlug: jest.fn(),
                        findBySlug: jest.fn(),  // 추가
                        getAllArticles: jest.fn(),
                        addTags: jest.fn(),
                        feed: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: FollowRepository,
                    useValue: {
                        findFollowingUser: jest.fn(),
                    },
                },
                {
                    provide: FavoriteRepository,
                    useValue: {
                        hasUserFavoritedArticle: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        articleService = module.get<ArticleService>(ArticleService);
        articleRepository = module.get(ArticleRepository);
        userRepository = module.get(UserRepository);
        followRepository = module.get(FollowRepository);
        favoriteRepository = module.get(FavoriteRepository);

        // 공통으로 사용할 user, profile, article 생성
        profile = new Profile();
        profile.username = 'test-user';
        profile.bio = '';
        profile.image = '';

        user = new User();
        user.id = 1;
        user.profile = profile;

        article = Article.builder()
            .setTitle('Test Article')
            .setSlug('test-article')
            .setTags([{ id: 1, name: "nestjs" } as Tag])
            .setDescription('This is a test article')
            .setAuthor(user)
            .setBody('Article content')
            .build();
        article.createdAt = new Date();
        article.updatedAt = new Date();
    });

    it('should be defined', () => {
        expect(articleService).toBeDefined();
    });

    describe('createArticle', () => {
        it('게시글을 성공적으로 생성해야 함', async () => {
            const dto: ArticleCreateRequestBodyDto = {
                title: article.title,
                description: article.description,
                body: article.body,
                tagList: ['nestjs'],
            };

            userRepository.findById.mockResolvedValue(user);
            articleRepository.addTags.mockResolvedValue([{ id: 1, name: "nestjs" } as Tag]);
            articleRepository.save.mockResolvedValue(article);

            const result = await articleService.createArticle(dto, user.id);

            expect(result.article.title).toBe(dto.title);
            expect(result.article.slug).toBe(article.slug);
            expect(articleRepository.save).toHaveBeenCalledWith(expect.any(Article));
        });
    });

    describe('findBySlug', () => {
        it('존재하는 게시글을 슬러그로 찾을 수 있어야 함', async () => {
            articleRepository.findArticleBySlug.mockResolvedValue(article);

            const result = await articleService.findBySlug(article.slug);

            expect(result.article.slug).toBe(article.slug);
            expect(articleRepository.findArticleBySlug).toHaveBeenCalledWith(article.slug);
        });

        it('게시글이 없으면 NotFoundException을 던져야 함', async () => {
            articleRepository.findArticleBySlug.mockRejectedValue(new NotFoundException('게시물을 찾을 수 없습니다.'));

            await expect(articleService.findBySlug('not-exist'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteArticleBySlug', () => {
        it('게시글 삭제 권한이 없는 경우 ForbiddenException을 던져야 함', async () => {
            const otherUserArticle = Article.builder().setAuthor({ id: 2 } as User).build();
            articleRepository.findBySlug.mockResolvedValue(otherUserArticle);

            await expect(articleService.deleteArticleBySlug(1, article.slug))
                .rejects.toThrow(ForbiddenException);
        });

        it('게시글을 정상적으로 삭제할 수 있어야 함', async () => {
            articleRepository.findBySlug.mockResolvedValue(article);

            await expect(articleService.deleteArticleBySlug(user.id, article.slug)).resolves.not.toThrow();
            expect(articleRepository.delete).toHaveBeenCalledWith(article);
        });
    });
});
