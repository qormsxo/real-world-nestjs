import { Test, TestingModule } from '@nestjs/testing';

import { ArticleController } from '../article.controller';
import { ArticleService } from '../article.service';
import { ArticleCreateRequestDto } from '../dto/req/article.create.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockArticleService = {
    createArticle: jest.fn(),
    findArticlesBySlug: jest.fn(),
    deleteArticlesById: jest.fn(),
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

  

});
