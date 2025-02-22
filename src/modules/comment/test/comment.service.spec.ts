import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../comment.service';
import { CommentRepository } from '../comment.repository';
import { UserRepository } from '../../user/user.repository';
import { ArticleRepository } from '../../article/article.repository';
import { CommentResponseDto } from '../dto/res/comment.response.dto';
import { CommentCreateDto } from '../dto/req/comment.create.dto';
import { Article } from '../../article/article.entity';
import { User } from '../../user/user.entity';
import { Comment } from '../comment.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Profile } from '../../profile/profile.entity';

jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));

describe('CommentService', () => {
    let commentService: CommentService;
    let commentRepository: CommentRepository;
    let userRepository: UserRepository;
    let articleRepository: ArticleRepository;
    
    let mockUser: User;
    let mockArticle: Article;
    let mockComment: Comment;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: CommentRepository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findArticlesComment: jest.fn(),
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
                    provide: ArticleRepository,
                    useValue: {
                        findBySlug: jest.fn(),
                        findArticlesBySlugforComments: jest.fn(),
                    },
                },
            ],
        }).compile();

        commentService = module.get<CommentService>(CommentService);
        commentRepository = module.get<CommentRepository>(CommentRepository);
        userRepository = module.get<UserRepository>(UserRepository);
        articleRepository = module.get<ArticleRepository>(ArticleRepository);

        // 공통 객체 생성 (빌더 패턴 사용)
        mockUser = new User();
        mockUser.id = 1;
        mockUser.profile = new Profile();
        mockUser.profile.followers = [];

        mockArticle = Article.builder()
            .setTitle('Test Article')
            .setSlug('test-article')
            .setDescription('Test Description')
            .setBody('Test Body')
            .setTags([])
            .setAuthor(mockUser)
            .build();

        // 공통 댓글 객체 설정
        mockComment = new Comment();
        mockComment.id = 1;
        mockComment.body = '테스트 댓글';
        mockComment.user = mockUser;
        mockComment.createdAt = new Date();
        mockComment.updatedAt = new Date();
    });

    it('should be defined', () => {
        expect(commentService).toBeDefined();
    });

    describe('createComment', () => {
        it('새로운 댓글을 생성해야 한다.', async () => {
            const slug = 'test-article';
            const dto: CommentCreateDto = { body: '테스트 댓글' };

            jest.spyOn(articleRepository, 'findBySlug').mockResolvedValue(mockArticle);
            jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
            jest.spyOn(commentRepository, 'create').mockResolvedValue(mockComment);
            jest.spyOn(commentRepository, 'save').mockResolvedValue(mockComment);

            const result = await commentService.createComment(mockUser.id, slug, dto);

            expect(result).toEqual(CommentResponseDto.toDto(mockComment, mockUser.id));
            expect(articleRepository.findBySlug).toHaveBeenCalledWith(slug);
            expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
            expect(commentRepository.create).toHaveBeenCalledWith(mockArticle, dto.body, mockUser);
            expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
        });
    });

    describe('deleteCommentsById', () => {
        it('댓글을 성공적으로 삭제해야 한다.', async () => {
            const commentId = 1;
            const slug = 'test-article';

            jest.spyOn(articleRepository, 'findBySlug').mockResolvedValue(mockArticle);
            jest.spyOn(commentRepository, 'findArticlesComment').mockResolvedValue(mockComment);
            jest.spyOn(commentRepository, 'delete').mockResolvedValue(undefined);

            await commentService.deleteCommentsById(mockUser.id, commentId, slug);

            expect(articleRepository.findBySlug).toHaveBeenCalledWith(slug);
            expect(commentRepository.findArticlesComment).toHaveBeenCalledWith(commentId, mockArticle.id);
            expect(commentRepository.delete).toHaveBeenCalledWith(mockComment);
        });

        it('존재하지 않는 댓글일 경우 NotFoundException을 던져야 한다.', async () => {
            const commentId = 1;
            const slug = 'test-article';

            jest.spyOn(articleRepository, 'findBySlug').mockResolvedValue(mockArticle);
            jest.spyOn(commentRepository, 'findArticlesComment').mockResolvedValue(null);

            await expect(commentService.deleteCommentsById(mockUser.id, commentId, slug)).rejects.toThrow(NotFoundException);
        });

        it('작성자가 아닐 경우 ForbiddenException을 던져야 한다.', async () => {
            const commentId = 1;
            const slug = 'test-article';
            const anotherUser = new User();
            anotherUser.id = 2;
            const mockAnotherComment = new Comment();
            mockAnotherComment.id = commentId;
            mockAnotherComment.user = anotherUser;
            mockAnotherComment.createdAt = new Date();
            mockAnotherComment.updatedAt = new Date();

            jest.spyOn(articleRepository, 'findBySlug').mockResolvedValue(mockArticle);
            jest.spyOn(commentRepository, 'findArticlesComment').mockResolvedValue(mockAnotherComment);

            await expect(commentService.deleteCommentsById(mockUser.id, commentId, slug)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findCommentsBySlug', () => {
        it('주어진 슬러그의 댓글 목록을 반환해야 한다.', async () => {
            const slug = 'test-article';

            // mockComment 배열 생성
            const mockComments = [
                mockComment, // 이미 생성된 mockComment 사용
                new Comment(),
            ];

            mockComments[1].id = 2;
            mockComments[1].body = '댓글2';
            mockComments[1].user = mockUser;
            mockComments[1].createdAt = new Date();
            mockComments[1].updatedAt = new Date();
            mockArticle.comments = mockComments;

            jest.spyOn(articleRepository, 'findArticlesBySlugforComments').mockResolvedValue(mockArticle);

            const result = await commentService.findCommentsBySlug(mockUser.id, slug);

            expect(result).toEqual({
                comments: mockComments.map(comment => CommentResponseDto.toDto(comment, mockUser.id)),
            });
            expect(articleRepository.findArticlesBySlugforComments).toHaveBeenCalledWith(slug);
        });
    });
});