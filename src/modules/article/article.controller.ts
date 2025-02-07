import { Body, Controller, ForbiddenException, Get, InternalServerErrorException, Post, Query, Request, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto, CreateArticleRequestDto } from './dto/req/article.create.dto';
import { ArticleDto, ArticleListDto, ArticlesDto, CreateArticleResponseDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';



@Controller('')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly authService: AuthService, // AuthService 주입
  ) { }

  @Post('/articles')
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @Request() req,
    @Body() createArticleReqDto: CreateArticleRequestDto
  ): Promise<CreateArticleResponseDto> {

    const { article } = createArticleReqDto
    return this.articleService.createArticle(article, req.user.id);

  }



  @Get('/articles')
  async getAllArticles(
    @Query(new ValidationPipe({ transform: true })) query: ArticleQueryDto,
    @Request() req,
  ): Promise<ArticlesDto> {
    
    const authorizationHeader = req.headers['authorization'];
    let articleDtos: ArticleListDto[] = [];
    let userId: number | null = null;

    // JWT 토큰 검증 및 사용자 ID 추출
    if (authorizationHeader) {
      const token = this.authService.extractTokenFromHeader(authorizationHeader);
      if (token) {
        try {
          const user = await this.authService.verifyToken(token); // JWT 토큰 검증
          userId = user.id;
        } catch (error) {
          throw error; // 오류는 AuthService에서 처리되므로 여기는 오류를 다시 던짐
        }
      }
    }

    // userId가 있을 경우, 로그인한 사용자에 맞게 가져옴
    articleDtos = userId
      ? await this.articleService.getAllArticles(query, userId)
      : await this.articleService.getAllArticles(query);

    return {
      articles: articleDtos,
      articlesCount: articleDtos.length,
    };

  }

}
