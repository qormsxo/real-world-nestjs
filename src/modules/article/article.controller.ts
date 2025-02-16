import { Body, Controller, Delete, ForbiddenException, Get, InternalServerErrorException, Param, Post, Put, Query, Req, Request, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/auth.guard';
import { ArticleService } from './article.service';
import { ArticleCreateRequestDto } from './dto/req/article.create.dto';
import { ArticleResponseDto, ArticlesDto, ArticleCreateResponseDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { PaginationDto } from '../../shared/dto/pagenation.dto';
import { UpdateArticleRequestDto } from './dto/req/article.update.dto';
import { CommentCreateRequestDto } from '../comment/dto/req/comment.create.dto';
import { JwtOptionalAuthGuard } from '../../guard/jwt-optional-auth.guard';



@Controller('/articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
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
  @UseGuards(JwtOptionalAuthGuard)
  async getAllArticles(
    @Query(new ValidationPipe({ transform: true })) query: ArticleQueryDto,
    @Request() req,
  ): Promise<ArticlesDto> {

    // JWT 토큰이 있을 경우 userId 추출, 없으면 null
    const userId = req.user?.id ?? null;

    // userId가 있을 경우, 로그인한 사용자에 맞게 가져옴
    const articleDtos = userId
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
    @Param('slug') slug: string
  ) {
    return await this.articleService.findBySlug(slug);
  }



  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  async updateArticleBySlug(
    @Param('slug') slug: string,
    @Req() req,
    @Body() updateArticleRequestDto: UpdateArticleRequestDto,
  ) {
    const { article } = updateArticleRequestDto;
    return await this.articleService.updateBySlug(req.user.id, slug, article);
  }



  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  async favorite(
    @Req() req,
    @Param('slug') slug: string,
  ) {
    return await this.articleService.favoriteArticle(req.user.id, slug)
  }


  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  async unfavorite(
    @Req() req,
    @Param('slug') slug: string,
  ) {
    return await this.articleService.unFavoriteArticle(req.user.id, slug)
  }

  @Post(':slug/comments')
  @UseGuards(JwtAuthGuard)
  async comment(
    @Req() req,
    @Param('slug') slug: string,
    @Body() reqDto: CommentCreateRequestDto,
  ) {
    const { comment } = reqDto
    return {
      comment: await this.articleService.createComment(req.user.id, slug, comment)
    }
  }

  @Get(':slug/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentByArticle(
    @Req() req,
    @Param('slug') slug: string,
  ) {

    // JWT 토큰이 있을 경우 userId 추출, 없으면 null
    const userId = req.user?.id ?? null;

    return await this.articleService.findCommentsBySlug(userId, slug)
  }

  @Delete(':slug/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Req() req,
    @Param('slug') slug: string,
    @Param('commentId') commentId: number,
  ) {
    return {
    
    }
  }


  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @Req() req,
    @Param('slug') slug: string,
    @Param('commentId') commentId: number,
  ) {
    return {
    
    }
  }

  

}
