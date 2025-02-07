import { Body, Controller,  ForbiddenException,  Get,  InternalServerErrorException,  Post, Query, Request, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto, CreateArticleRequestDto } from './dto/req/article.create.dto';
import { ArticleDto, ArticleListDto, ArticlesDto, CreateArticleResponseDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { JwtService } from '@nestjs/jwt';



@Controller('')
export class ArticleController {
  constructor(
    private readonly articleService : ArticleService,
    private readonly jwtService: JwtService
) {}

  @Post('/articles')
  @UseGuards(JwtAuthGuard)
  async createArticle(@Request() req, @Body() createArticleReqDto : CreateArticleRequestDto): Promise<CreateArticleResponseDto>{
    const { article } = createArticleReqDto
    return this.articleService.createArticle(article,req.user.id);
  }



  @Get('/articles')
  async getAllArticles(
    @Query(new ValidationPipe({ transform: true })) query: ArticleQueryDto,
    @Request() req,
  ): Promise<ArticlesDto> {
    
    const authorizationHeader = req.headers['authorization'];

    let articleDtos: ArticleListDto[] = [];
    
    if(authorizationHeader){

      const token = authorizationHeader.split(' ')[1];
      console.log(token);
      console.log(process.env.JWT_SECRET);
      
      
      try {

        const user = await this.jwtService.verify(token,{secret:process.env.JWT_SECRET}); // JWT 토큰 검증

        articleDtos =  await this.articleService.getAllArticles(query,user.id);
        
      } catch (error) {
        throw new InternalServerErrorException(error)
      }

    }else{
        articleDtos =  await this.articleService.getAllArticles(query);
    }

    return {
      articles: articleDtos,
      articlesCount:articleDtos.length
    }

  }

}
