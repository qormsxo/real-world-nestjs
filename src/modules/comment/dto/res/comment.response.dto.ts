import { ProfileResponseDto } from "../../../profile/dto/res/profile.response.dto";
import { Comment } from '../../comment.entity';

export class CommentResponseDto {
    id: number;
    createdAt: string;
    updatedAt: string;
    body: string;
    author: ProfileResponseDto;

    static toDto(comment: Comment, userId?: number): CommentResponseDto {
        return {
            id: comment.id,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
            body: comment.body,
            author: ProfileResponseDto.toDto(comment.user.profile, userId),
        };
    }
}

export class CommentCreateResponseDto {
    comment: CommentResponseDto;
}

export class CommentsDto {
    comments: CommentResponseDto[];
}