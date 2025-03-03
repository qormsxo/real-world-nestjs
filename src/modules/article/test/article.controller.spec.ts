import { Test, TestingModule } from '@nestjs/testing';

import { ArticleController } from '../article.controller';
import { ArticleService } from '../article.service';
import { ArticleCreateRequestDto } from '../dto/req/article.create.dto';
import { ArticleDto } from '../dto/res/article.response.dto';
import { ProfileResponseDto } from '../../profile/dto/res/profile.response.dto';

const mockArticleService = {
  createArticle: jest.fn(),
  getAllArticles: jest.fn(),
  findBySlug: jest.fn(),
  updateBySlug: jest.fn(),
  deleteArticleBySlug: jest.fn(),
  favoriteArticle: jest.fn(),
  unFavoriteArticle: jest.fn(),
  feed: jest.fn(),
};

describe('articleController', () => {
  let articleController: ArticleController;
  let articleService: ArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    }).compile();

    articleController = module.get<ArticleController>(ArticleController);
    articleService = module.get<ArticleService>(ArticleService);
  });
  

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(articleController).toBeDefined();
  });

  describe('createArticle', () => {
    it('should create an article', async () => {
      const req = { user: { id: 1 } };
      const dto: ArticleCreateRequestDto = { article: {
        title: 'Test', body: 'Content',
        description: '',
        tagList: []
      } };
      const result: ArticleDto = { article: {
        slug: 'test', title: 'Test',
        description: '',
        tagList: [],
        createdAt: '',
        updatedAt: '',
        favorited: false,
        favoritesCount: 0,
        author: new ProfileResponseDto
      } };
      mockArticleService.createArticle.mockResolvedValue(result);

      expect(await articleController.createArticle(req, dto)).toEqual(result);
      expect(articleService.createArticle).toHaveBeenCalledWith(dto.article, req.user.id);
    });
  });

  describe('getArticleBySlug', () => {
    it('should return an article by slug', async () => {
      const slug = 'test';
      const result: ArticleDto = { article: {
        slug: 'test', title: 'Test',
        description: '',
        tagList: [],
        createdAt: '',
        updatedAt: '',
        favorited: false,
        favoritesCount: 0,
        author: new ProfileResponseDto
      } };
      mockArticleService.findBySlug.mockResolvedValue(result);

      expect(await articleController.getArticleBySlug(slug)).toEqual(result);
      expect(articleService.findBySlug).toHaveBeenCalledWith(slug);
    });
  });

  describe('deleteArticle', () => {
    it('should delete an article by slug', async () => {
      const req = { user: { id: 1 } };
      const slug = 'test';

      await articleController.deleteArticle(req, slug);
      expect(articleService.deleteArticleBySlug).toHaveBeenCalledWith(req.user.id, slug);
    });
  });

});
