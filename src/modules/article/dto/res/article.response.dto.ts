import { Profile } from "src/modules/profile/profile.entity";
import { Article } from "../../article.entity";

export class AuthorDto {
    username: string;
    bio?: string;
    image?: string;
    following: boolean;

    static toDto(profile: Profile): AuthorDto {
        return {
            username: profile.username,
            bio: profile.bio,
            image: profile.image,
            following: false
        }
    }
}

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
    author: AuthorDto;

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
            author: AuthorDto.toDto(article.author.profile),
        };
    }
}

export class ArticleCreateResponseDto {
    article: ArticleResponseDto;
}

export class ArticlesDto {
    articles: ArticleResponseDto[];
    articlesCount: number;
}