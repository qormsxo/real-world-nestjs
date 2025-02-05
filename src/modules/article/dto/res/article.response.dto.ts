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
            favorited: false, // 예시로 false로 설정, 실제 값은 필요시 처리
            favoritesCount: 0,
            author:AuthorDto.toDto(article.author.profile)
        }
    }
    
}
  
export class CreateArticleResponseDto {
    article: ArticleDto;
}