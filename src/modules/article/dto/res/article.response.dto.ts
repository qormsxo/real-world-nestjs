import { Profile } from "src/modules/profile/profile.entity";
import { Article } from "../../article.entity";

export class AuthorDto {
    username: string;
    bio?: string;
    image?: string;
    following: boolean;

    static toDto(profile:Profile) : AuthorDto{
        return {
            username : profile.username,
            bio:profile.bio,
            image:profile.image,
            following : false
        }
    }
}
  
export class ArticleDto {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: AuthorDto;

    static toDto(article: Article): ArticleDto{
        return {
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tags.map(tag => tag.name),
            createdAt: article.createdAt.toISOString(), 
            updatedAt: article.updatedAt.toISOString(), 
            favorited: false,
            favoritesCount: 0,
            author:AuthorDto.toDto(article.author.profile)
        }
    }
    
}

  
export class CreateArticleResponseDto {
    article: ArticleDto;
}

export class ArticleListDto {
    slug: string;
    title: string;
    description: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: AuthorDto;

    static toDto(article: Article, id?:number): ArticleListDto {
        
    const favoritesCount = (article.favorites || []).length;  // favorites가 undefined일 경우 빈 배열로 처리
        
        let favorited = false;

        if (id && article.favorites) {
            // user가 있다면, 이 사용자가 이 글을 좋아요 했는지 확인
            favorited = article.favorites.some(favorite => favorite.user.id === id);
        }

        return {
            slug: article.slug,
            title: article.title,
            description: article.description,
            tagList: article.tags.map(tag => tag.name),
            createdAt: article.createdAt.toISOString(),
            updatedAt: article.updatedAt.toISOString(),
            favorited: false,
            favoritesCount: favoritesCount,
            author: AuthorDto.toDto(article.author.profile),
        };
    }
}
export class ArticlesDto {
    articles: ArticleListDto[];
    articlesCount: number;
}