import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { Article } from '../article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentRepository {
    constructor(
        @InjectRepository(Comment)
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
