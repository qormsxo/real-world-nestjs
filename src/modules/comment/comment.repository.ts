import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Tag } from '../tag/tag.entity';  // Tag와 관련된 작업을 할 경우
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { Article } from '../article/article.entity';

@Injectable()
export class CommentRepository {
    constructor(
        private readonly commentRepository: Repository<Comment>,
    ) {}

    async save(comment:Comment) : Promise<Comment>{
        return await this.commentRepository.save(comment);
    }

    async create(article:Article, body: string , user: User ): Promise<Comment>{
        return this.commentRepository.create({
            article,
            body,
            user
        })
    }

    async findArticlesComment(commentId:number, artcileId: number){
        return  await this.commentRepository.findOne({
            where: { id: commentId, article: { id: artcileId } },
            relations: ['user'],
        });
    }

    async delete(comment:Comment){
        this.commentRepository.remove(comment)
    }

}
