import { Body, Controller,  Post, Request, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto, CreateArticleRequestDto } from './dto/req/article.create.dto';
import { CreateArticleResponseDto } from './dto/res/article.response.dto';



@Controller('')
export class ArticleController {
  constructor(
    private readonly articleService : ArticleService
) {}

  @Post('/articles')
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() req, @Body() createArticleReqDto : CreateArticleRequestDto): Promise<CreateArticleResponseDto>{
    const { article } = createArticleReqDto
    return this.articleService.createArticle(article,req.user.id);
  }

}
