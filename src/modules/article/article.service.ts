import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Transactional } from 'typeorm-transactional';
import { Article } from './article.entity';
import { ArticleCreateRequestBodyDto } from './dto/req/article.create.dto';
import { Tag } from '../tag/tag.entity';
import { User } from '../user/user.entity';
import { ArticleResponseDto,  ArticlesDto, ArticleCreateResponseDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { Follow } from '../follow/follow.entity';
import { PaginationDto } from 'src/shared/dto/pagenation.dto';
import { UpdateArticleDto } from './dto/req/article.update.dto';
import { Favorite } from '../favorite/favorite.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,

        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,

        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
    ) { }

    @Transactional()
    async createArticle(dto: ArticleCreateRequestBodyDto, id: number): Promise<ArticleCreateResponseDto> {
        const { title, description, body, tagList } = dto;

        // 프로필 정보를 가져오기 위해 relations 옵션 추가
        const author = await this.getAuthorById(id)
        const tags = await this.addTags(tagList);

        //Article 생성
        const article = this.articleRepository.create({
            title,
            slug: this.generateSlug(title),
            description,
            body,
            author,
            tags,
        });
        await this.articleRepository.save(article);

        const articleDto = ArticleResponseDto.toDto(article);

        return { article: articleDto };
    }

    private async getAuthorById(id: number): Promise<User> {

        return await this.userRepository.findOne({
            where: { id: id },
            relations: ['profile'], // 여기 추가!
        })
            ||
            (() => { throw new NotFoundException(`유저를 찾을 수 없습니다.`); })();;
    }

    private async addTags(tagList: string[]): Promise<Tag[]> {

        const tagPromises = tagList.map(async (tagName) => {
            let tag = await this.tagRepository.findOneBy({ name: tagName });
            if (!tag) {
                tag = this.tagRepository.create({ name: tagName });
                await this.tagRepository.save(tag);
            }
            return tag;
        });

        return Promise.all(tagPromises);
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

    async getAllArticles(query: ArticleQueryDto, id?: number): Promise<ArticleResponseDto[]> {

        const { tag, author, favorited, limit, offset } = query;
        // 기본 쿼리로 필터링 없이 데이터를 먼저 가져옴
        let queryBuilder = this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .leftJoinAndSelect('author.profile', 'profile')
            .leftJoinAndSelect('profile.followers' , 'follow')
            .leftJoinAndSelect('follow.follower', 'followerUser')  // 실제 팔로워인 user 로드
            .leftJoinAndSelect('article.tags', 'tags')
            .leftJoinAndSelect('article.favorites', 'favorite')
            .leftJoinAndSelect('favorite.user', 'favoriteUser')
            .leftJoin('favoriteUser.profile', 'favoriteProfile')

        // 필터링 조건을 순차적으로 추가
        if (tag) {
            queryBuilder.andWhere('tags.name = :tag', { tag });
        }

        if (author) {
            queryBuilder.andWhere('profile.username = :author', { author });
        }

        if (favorited) {
            queryBuilder.andWhere('favoriteProfile.username = :favorited', { favorited });
        }

        // 필터링된 데이터를 기준으로 limit, offset을 적용
        queryBuilder
            .skip(offset)
            .take(limit)
            .orderBy('article.createdAt', 'DESC');

        // 결과 쿼리 실행
        const articles = await queryBuilder.getMany();

        return articles.map((article) => ArticleResponseDto.toDto(article, id))
    }

    async feed(id: number, query: PaginationDto) {

        const { limit, offset } = query;

        // 팔로우 하고 있는 사람 조회 
        const followingUsers = await this.followRepository.find({
            where: { follower: { id } },
            relations: ['following.user'],
        })

        // 팔로우 하고 있는 사람들의 userid 추출
        const followingUserIds = followingUsers.map(follow => follow.following.user.id)


        const articles = await this.articleRepository.find({
            where: { author: { id: In(followingUserIds) } },
            relations: ['author', 'author.profile', 'author.profile.followers', 'tags', 'favorites' , 'favorites.user'],
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
        })

        return articles.map((article) => ArticleResponseDto.toDto(article, id))

    }

    async findBySlug(slug: string): Promise<ArticleResponseDto> {
        const article = await this.articleRepository.findOne({
            // where: { slug: Like(`%${slug}%`) },
            where: { slug },
            relations: ['author', 'author.profile', 'author.profile.followers', 'tags', 'favorites' , 'favorites.user'],
        }) || (() => { throw new NotFoundException("게시물을 찾을 수 없습니다.") })()

        console.log(article.author.profile);
        return ArticleResponseDto.toDto(article, undefined)
    }

    @Transactional()
    async updateBySlug(id:number , slug: string, dto: UpdateArticleDto): Promise<ArticleResponseDto> {
        const article = await this.articleRepository.findOne({
            // where: { slug: Like(`%${slug}%`) },
            where: { slug },
            relations: ['author', 'author.profile', 'author.profile.followers', 'tags', 'favorites' , 'favorites.user'],
        }) || (() => { throw new NotFoundException("게시물을 찾을 수 없습니다.") })()


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

        return ArticleResponseDto.toDto(article, id)
    }

    @Transactional()
    async favoriteArticle(id:number, slug:string) : Promise<ArticleResponseDto> {
        const article = await this.articleRepository.findOne({
            // where: { slug: Like(`%${slug}%`) },
            where: { slug },
            relations: ['author', 'author.profile', 'author.profile.followers', 'tags', 'favorites' , 'favorites.user'],
        }) || (() => { throw new NotFoundException("게시물을 찾을 수 없습니다.") })()

        // 사용자가 이미 좋아요를 눌렀는지 확인
        const existingFavorite = await this.favoriteRepository.findOne({
            where: { user: { id }, article: { id: article.id } },
        });

        if (!existingFavorite) {
            // 좋아요 추가
            const favorite = this.favoriteRepository.create({ user: { id }, article });
            await this.favoriteRepository.save(favorite);
        
            article.favorites.push(favorite)
            await this.articleRepository.save(article);
        }
        
    
        return ArticleResponseDto.toDto(article, id);

    }

    @Transactional()
    async unFavoriteArticle(id:number, slug:string) : Promise<ArticleResponseDto> {
        const article = await this.articleRepository.findOne({
            // where: { slug: Like(`%${slug}%`) },
            where: { slug },
            relations: ['author', 'author.profile', 'author.profile.followers', 'tags', 'favorites' , 'favorites.user'],
        }) || (() => { throw new NotFoundException("게시물을 찾을 수 없습니다.") })()

        // 사용자가 이미 좋아요를 눌렀는지 확인
        const existingFavorite = await this.favoriteRepository.findOne({
            where: { user: { id }, article: { id: article.id } },
        });

        if (existingFavorite) {
            // 좋아요 제거
            await this.favoriteRepository.remove(existingFavorite);
            article.favorites = article.favorites.filter(fav => fav.user.id !== id);
            await this.articleRepository.save(article);
        }

        return ArticleResponseDto.toDto(article, id);

    }

}
