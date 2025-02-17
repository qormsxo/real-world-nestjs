import { Article } from "../../article.entity";
import { ProfileResponseDto } from "../../../profile/dto/res/profile.response.dto";

export class ArticleResponseDto {
    slug: string;
    title: string;
    description: string;
    // body: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: ProfileResponseDto;

    static toDto(article: Article, id?: number): ArticleResponseDto {

        const favoritesCount = (article.favorites || []).length;  // favorites가 undefined일 경우 빈 배열로 처

        let favorited = false;

        if (id && article.favorites) {
            favorited = article.favorites.some(favorite =>favorite.user && favorite.user.id === id);
        }

        return {
            slug: article.slug,
            title: article.title,
            description: article.description,
            tagList: article.tags.map(tag => tag.name),
            createdAt: article.createdAt.toISOString(),
            updatedAt: article.updatedAt.toISOString(),
            favorited: favorited,
            favoritesCount: favoritesCount,
            author: ProfileResponseDto.toDto(article.author.profile,id),
        };
    }
}

export class ArticleDto {
    article: ArticleResponseDto;
}

export class ArticlesDto {
    articles: ArticleResponseDto[];
    articlesCount: number;
}