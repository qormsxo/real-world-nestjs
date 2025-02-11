import { Body, Controller, ForbiddenException, Get, InternalServerErrorException, Param, Post, Put, Query, Req, Request, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ArticleService } from './article.service';
import { ArticleCreateRequestDto } from './dto/req/article.create.dto';
import { ArticleResponseDto, ArticlesDto, ArticleCreateResponseDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { AuthService } from 'src/auth/auth.service';
import { PaginationDto } from 'src/shared/dto/pagenation.dto';
import { UpdateArticleRequestDto } from './dto/req/article.update.dto';



@Controller('/articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly authService: AuthService, // AuthService 주입
  ) { }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @Request() req,
    @Body() dto: ArticleCreateRequestDto
  ): Promise<ArticleCreateResponseDto> {

    const { article } = dto
    return this.articleService.createArticle(article, req.user.id);

  }



  @Get('')
  async getAllArticles(
    @Query(new ValidationPipe({ transform: true })) query: ArticleQueryDto,
    @Request() req,
  ): Promise<ArticlesDto> {

    const authorizationHeader = req.headers['authorization'];
    let articleDtos: ArticleResponseDto[] = [];
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

  
  @Get('/feed')
  @UseGuards(JwtAuthGuard)
  async feed(
    @Request() req,
    @Query() query: PaginationDto // DTO 적용
  ): Promise<ArticlesDto> {
    const articles = await this.articleService.feed(req.user.id, query)
    return {
      articles: articles,
      articlesCount: articles.length
    }
  }

  @Get(':slug')
  // @UseGuards(JwtAuthGuard)
  async getArticleBySlug(
    @Param('slug') slug : string
  ) {
    return await this.articleService.findBySlug(slug);
  }



  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  async updateArticleBySlug(
    @Param('slug') slug : string,
    @Req() req ,
    @Body() updateArticleRequestDto: UpdateArticleRequestDto, 
  ) {
    const { article } = updateArticleRequestDto;
    return await this.articleService.updateBySlug(req.user.id,slug,article);
  }


  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  async favorite(
    @Req() req,
    @Param('slug') slug : string,
  ) {
    return await this.articleService.favoriteArticle(req.user.id, slug)
  }

}
