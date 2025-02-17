import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ArticleService } from "../article/article.service";
import { User } from "../user/user.entity";
import { CommentCreateDto } from "./dto/req/comment.create.dto";
import { CommentResponseDto, CommentsDto } from "./dto/res/comment.response.dto";
import { Comment } from "./comment.entity";


@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly articleService: ArticleService,
    ) {}

    async createComment(id: number, slug: string, dto: CommentCreateDto): Promise<CommentResponseDto> {
        const article = await this.articleService.findArticleBySlug(slug);

        const commentedUser = await this.getUserById(id);


        const comment = this.commentRepository.create({
            article,
            body: dto.body,
            user: commentedUser
        })
        const savedComment = await this.commentRepository.save(comment);

        return CommentResponseDto.toDto(savedComment, id)
    }

    async deleteCommentsById(id: number, commentId: number, slug: string): Promise<void> {
        const article = await this.articleService.findArticleBySlug(slug);

        const comment = await this.commentRepository.findOne({
            where: { id: commentId, article },
            relations: ['user'],
        });

        if (!comment) throw new NotFoundException('찾을 수 없는 댓글입니다.');
        if (comment.user.id !== id) throw new ForbiddenException('작성자가 아닙니다.');

        await this.commentRepository.remove(comment);
    }

    private async getUserById(id: number): Promise<User> {
        return await this.userRepository.findOne({ where: { id } }) || (() => { throw new NotFoundException(`유저를 찾을 수 없습니다.`); })();
    }


     async findCommentsBySlug(id: number, slug: string): Promise<CommentsDto> {
        const article = await this.articleService.findArticlesBySlugforComments(slug)

        const comments = article.comments

        return {
            comments: comments.map( (comment) => CommentResponseDto.toDto(comment, id))
        }
    }
}