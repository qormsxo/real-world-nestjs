import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Article } from './article.entity';
import { ArticleCreateRequestBodyDto } from './dto/req/article.create.dto';
import { ArticleResponseDto, ArticlesDto, ArticleDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { PaginationDto } from 'src/shared/dto/pagenation.dto';
import { UpdateArticleDto } from './dto/req/article.update.dto';
import { Favorite } from '../favorite/favorite.entity';
import { ArticleRepository } from './article.repository';
import { FollowRepository } from '../follow/follow.repository';
import { UserRepository } from '../user/user.repository';
import { FavoriteRepository } from '../favorite/favorite.repository';

@Injectable()
export class ArticleService {
    constructor(

        private readonly articleRepository: ArticleRepository,

        private readonly userRepository: UserRepository,

        private readonly followRepository: FollowRepository,

        private readonly favoriteRepository: FavoriteRepository,
    ) { }

    @Transactional()
    async createArticle(dto: ArticleCreateRequestBodyDto, id: number): Promise<ArticleDto> {
        const { title, description, body, tagList } = dto;

        const author = await this.userRepository.findById(id)
        const tags = await this.articleRepository.addTags(tagList);

        //Article 생성
        const article = await this.articleRepository.save(Article.builder()
            .setTitle(title)
            .setSlug(this.generateSlug(title))
            .setDescription(description)
            .setBody(body)
            .setAuthor(author)
            .setTags(tags)
            .build()
        )

        const articleDto = ArticleResponseDto.toDto(article);

        return { article: articleDto };
    }


    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // 게시글 목록 페이징
    async getAllArticles(query: ArticleQueryDto, id?: number): Promise<ArticlesDto> {

        const articles = await this.articleRepository.getAllArticles(query);

        return {
            articles: articles.map((article) => ArticleResponseDto.toDto(article, id)),
            articlesCount: articles.length
        }
    }

    // 내가 팔로우 한 사람의 게시글 목록 페이징
    async feed(id: number, query: PaginationDto): Promise<ArticlesDto> {

        // 팔로우 하고 있는 사람 조회 
        const followingUsers = await this.followRepository.findFollowingUser(id)
        // 팔로우 하고 있는 사람들의 userid 추출
        const followingUserIds = followingUsers.map(follow => follow.following.user.id)


        const articles = await this.articleRepository.feed(followingUserIds, query)

        return {
            articles: articles.map((article) => ArticleResponseDto.toDto(article, id)),
            articlesCount: articles.length
        }

    }

    public async findArticleBySlug(slug: string): Promise<Article> {
        return await this.articleRepository.findArticleBySlug(slug)
    }

    // 슬러그로 게시글 조회
    async findBySlug(slug: string): Promise<ArticleDto> {
        const article = await this.articleRepository.findArticleBySlug(slug)

        return {
            article: ArticleResponseDto.toDto(article),
        }
    }

    // 게시글 업데이트 
    @Transactional()
    async updateBySlug(id: number, slug: string, dto: UpdateArticleDto): Promise<ArticleDto> {
        const article = await this.articleRepository.findArticleBySlug(slug)

        const { title, description, body } = dto;

        // 타이틀이 있으면 slug를 새로 생성
        if (title) {
            article.title = title;
            article.slug = this.generateSlug(title);  // 새로운 slug 생성
        }

        if (description) article.description = description;
        if (body) article.body = body;

        // 데이터베이스에 업데이트
        await this.articleRepository.save(article);

        return {
            article: ArticleResponseDto.toDto(article, id)
        }
    }


    @Transactional()
    async favoriteArticle(id: number, slug: string): Promise<ArticleDto> {
        const article = await this.findArticleBySlug(slug);

        // 사용자가 이미 좋아요를 눌렀는지 확인
        const existingFavorite = await this.favoriteRepository.hasUserFavoritedArticle(id,article.id)

        if (!existingFavorite) {
            // 좋아요 추가
            const favorite = await this.favoriteRepository.create(id,article);
            await this.favoriteRepository.save(favorite);

            article.favorites.push(favorite)
            await this.articleRepository.save(article);
        }


        return {
            article: ArticleResponseDto.toDto(article, id)
        }

    }

    @Transactional()
    async unFavoriteArticle(id: number, slug: string): Promise<ArticleDto> {
        const article = await this.findArticleBySlug(slug);
        // 사용자가 이미 좋아요를 눌렀는지 확인
        const existingFavorite = await this.favoriteRepository.hasUserFavoritedArticle(id,article.id)


        if (existingFavorite) {
            // 좋아요 제거
            await this.favoriteRepository.delete(existingFavorite);
            article.favorites = article.favorites.filter(fav => fav.user.id !== id);
            await this.articleRepository.save(article);
        }

        return {
            article: ArticleResponseDto.toDto(article, id)
        }

    }

    async findArticlesBySlugforComments(slug: string): Promise<Article> {
        const article = await this.articleRepository.findArticlesBySlugforComments(slug)
        return article;
    }

}
