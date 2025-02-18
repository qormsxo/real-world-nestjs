import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Article } from '../article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoriteRepository {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
    ) { }

    async create(userid: number, article: Article, ): Promise<Favorite> {
        return this.favoriteRepository.create({
            user: { id: userid },
            article
        }
        );
    }

    async save(favorite: Favorite): Promise<Favorite> {
        return await this.favoriteRepository.save(favorite);
    }

    async hasUserFavoritedArticle(userId: number, articleId: number): Promise<Favorite | null> {
        // 사용자가 이미 좋아요를 눌렀는지 확인
        return await this.favoriteRepository.findOne({
            where: { user: { id: userId }, article: { id: articleId } },
        });

    }

    async delete(favorite: Favorite) {
        await this.favoriteRepository.remove(favorite);
    }

}
