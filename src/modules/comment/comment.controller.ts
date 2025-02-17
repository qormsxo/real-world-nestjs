import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post,  Req,  UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/auth.guard';
import { PaginationDto } from '../../shared/dto/pagenation.dto';
import { CommentCreateRequestDto } from '../comment/dto/req/comment.create.dto';
import { JwtOptionalAuthGuard } from '../../guard/jwt-optional-auth.guard';
import { CommentService } from './comment.service';



@Controller('/articles')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
  ) { }

  @Post(':slug/comments')
  @UseGuards(JwtAuthGuard)
  async comment(
    @Req() req,
    @Param('slug') slug: string,
    @Body() reqDto: CommentCreateRequestDto,
  ) {
    const { comment } = reqDto
    return {
      comment: await this.commentService.createComment(req.user.id, slug, comment)
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

    return await this.commentService.findCommentsBySlug(userId, slug)
  }

  @Delete(':slug/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Req() req,
    @Param('slug') slug: string,
    @Param('commentId') commentId: number,
  ) {
    await this.commentService.deleteCommentsById(req.user.id ,commentId,slug);
    return { message: '댓글이 성공적으로 삭제되었습니다.' }; 
  }
  

}
