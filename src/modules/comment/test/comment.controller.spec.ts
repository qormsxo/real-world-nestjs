import { Test, TestingModule } from '@nestjs/testing';

import { CommentController } from '../comment.controller';
import { CommentService } from '../comment.service';
import { CommentCreateRequestDto } from '../dto/req/comment.create.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockCommentService = {
    createComment: jest.fn(),
    findCommentsBySlug: jest.fn(),
    deleteCommentsById: jest.fn(),
};

describe('commentController', () => {
  let commentController: CommentController;
  let commentService: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    }).compile();

    commentController = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });
  

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(commentController).toBeDefined();
  });

  describe('comment', () => {
    it('댓글을 정상적으로 생성해야 한다', async () => {
      const req = { user: { id: 1 } };
      const slug = 'test-article';
      const dto: CommentCreateRequestDto = { comment: { body: 'Test comment' } };
      const createdComment = { id: 1, body: 'Test comment' };

      mockCommentService.createComment.mockResolvedValue(createdComment);

      const result = await commentController.comment(req, slug, dto);

      expect(result).toEqual({ comment: createdComment });
      expect(mockCommentService.createComment).toHaveBeenCalledWith(1, slug, dto.comment);
    });
  });

  describe('getCommentByArticle', () => {
    it('특정 게시글의 댓글을 조회해야 한다', async () => {
      const req = { user: { id: 1 } };
      const slug = 'test-article';
      const comments = { comments: [{ id: 1, body: 'Test comment' }] };

      mockCommentService.findCommentsBySlug.mockResolvedValue(comments);

      const result = await commentController.getCommentByArticle(req, slug);

      expect(result).toEqual(comments);
      expect(mockCommentService.findCommentsBySlug).toHaveBeenCalledWith(1, slug);
    });
  });

  describe('deleteComment', () => {
    it('댓글을 정상적으로 삭제해야 한다', async () => {
      const req = { user: { id: 1 } };
      const slug = 'test-article';
      const commentId = 1;

      mockCommentService.deleteCommentsById.mockResolvedValue(undefined);

      const result = await commentController.deleteComment(req, slug, commentId);

      expect(result).toEqual({ message: '댓글이 성공적으로 삭제되었습니다.' });
      expect(mockCommentService.deleteCommentsById).toHaveBeenCalledWith(1, commentId, slug);
    });

    it('존재하지 않는 댓글을 삭제하려 하면 예외가 발생해야 한다', async () => {
      const req = { user: { id: 1 } };
      const slug = 'test-article';
      const commentId = 1;

      mockCommentService.deleteCommentsById.mockRejectedValue(new NotFoundException('찾을 수 없는 댓글입니다.'));

      await expect(commentController.deleteComment(req, slug, commentId)).rejects.toThrow(NotFoundException);
    });

    it('작성자가 아닌 유저가 댓글을 삭제하려 하면 예외가 발생해야 한다', async () => {
      const req = { user: { id: 2 } };
      const slug = 'test-article';
      const commentId = 1;

      mockCommentService.deleteCommentsById.mockRejectedValue(new ForbiddenException('작성자가 아닙니다.'));

      await expect(commentController.deleteComment(req, slug, commentId)).rejects.toThrow(ForbiddenException);
    });
  });

});
