import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";;
import { CommentCreateDto } from "./dto/req/comment.create.dto";
import { CommentResponseDto, CommentsDto } from "./dto/res/comment.response.dto";
import { ArticleRepository } from "../article/article.repository";
import { Transactional } from "typeorm-transactional";
import { CommentRepository } from "./comment.repository";
import { UserRepository } from "../user/user.repository";


@Injectable()
export class CommentService {
    constructor(
        private readonly commentRepository: CommentRepository,

        private readonly userRepository: UserRepository,

        private readonly articleRepository: ArticleRepository,
    ) { }

    @Transactional()
    async createComment(id: number, slug: string, dto: CommentCreateDto): Promise<CommentResponseDto> {
        const article = await this.articleRepository.findBySlug(slug);

        const commentedUser = await this.userRepository.findById(id);

        const comment = await this.commentRepository.create(article, dto.body,commentedUser)
        const savedComment = await this.commentRepository.save(comment);

        return CommentResponseDto.toDto(savedComment, id)
    }

    @Transactional()
    async deleteCommentsById(id: number, commentId: number, slug: string): Promise<void> {
        const article = await this.articleRepository.findBySlug(slug);

        const comment = await this.commentRepository.findArticlesComment(commentId,article.id)


        if (!comment) throw new NotFoundException('찾을 수 없는 댓글입니다.');
        if (comment.user.id !== id) throw new ForbiddenException('작성자가 아닙니다.');

        await this.commentRepository.delete(comment);
    }


    async findCommentsBySlug(id: number, slug: string): Promise<CommentsDto> {
        const article = await this.articleRepository.findArticlesBySlugforComments(slug)

        const comments = article.comments

        return {
            comments: comments.map((comment) => CommentResponseDto.toDto(comment, id))
        }
    }
}