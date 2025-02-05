import { Body, Controller,  Get,  Post, Request, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto, CreateArticleRequestDto } from './dto/req/article.create.dto';
import { ArticleDto, ArticleListDto, ArticlesDto, CreateArticleResponseDto } from './dto/res/article.response.dto';



@Controller('')
export class ArticleController {
  constructor(
    private readonly articleService : ArticleService
) {}

  @Post('/articles')
  @UseGuards(JwtAuthGuard)
  async createArticle(@Request() req, @Body() createArticleReqDto : CreateArticleRequestDto): Promise<CreateArticleResponseDto>{
    const { article } = createArticleReqDto
    return this.articleService.createArticle(article,req.user.id);
  }
  @Get('/articles')
  async getAllArticles(): Promise<ArticlesDto>{
      const articleDtos : ArticleListDto[] =  await this.articleService.getAllArticles();
      return {
        articles: articleDtos,
        articlesCount:articleDtos.length
      }
  }
}
