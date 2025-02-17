import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { CommentCreateDto } from "./dto/req/comment.create.dto";
import { CommentResponseDto, CommentsDto } from "./dto/res/comment.response.dto";
import { Comment } from "./comment.entity";
import { ArticleRepository } from "../article/article.repository";
import { Transactional } from "typeorm-transactional";
import { CommentRepository } from "./comment.repository";


@Injectable()
export class CommentService {
    constructor(
        private readonly commentRepository: CommentRepository,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly articleRepository: ArticleRepository,
    ) { }

    @Transactional()
    async createComment(id: number, slug: string, dto: CommentCreateDto): Promise<CommentResponseDto> {
        const article = await this.articleRepository.findBySlug(slug);

        const commentedUser = await this.getUserById(id);

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

    private async getUserById(id: number): Promise<User> {
        return await this.userRepository.findOne({ where: { id } }) || (() => { throw new NotFoundException(`유저를 찾을 수 없습니다.`); })();
    }


    async findCommentsBySlug(id: number, slug: string): Promise<CommentsDto> {
        const article = await this.articleRepository.findArticlesBySlugforComments(slug)

        const comments = article.comments

        return {
            comments: comments.map((comment) => CommentResponseDto.toDto(comment, id))
        }
    }
}