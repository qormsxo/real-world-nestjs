import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Article } from './article.entity';
import { Tag } from '../tag/tag.entity';  // Tag와 관련된 작업을 할 경우
import { User } from '../user/user.entity';
import { Follow } from '../follow/follow.entity';
import { Favorite } from '../favorite/favorite.entity';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { PaginationDto } from 'src/shared/dto/pagenation.dto';
import { UpdateArticleDto } from './dto/req/article.update.dto';

@Injectable()
export class ArticleRepository {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,

        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,

        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
    ) {}

    async getUserById(id: number): Promise<User> {

        return await this.userRepository.findOne({
            where: { id: id },
            relations: ['profile'], // 여기 추가!
        }) || (() => { throw new NotFoundException(`유저를 찾을 수 없습니다.`); })();;
    }

    async addTags(tagList: string[]): Promise<Tag[]> {
        const tags = await Promise.all(
            tagList.map(async (tagName) => {
                let tag = await this.tagRepository.findOneBy({ name: tagName });
                if (!tag) {
                    tag = this.tagRepository.create({ name: tagName });
                    await this.tagRepository.save(tag);
                }
                return tag;
            }),
        );
        return tags;
    }

    async save(article :Article) {
        return await this.articleRepository.save(article)
    }

    async getAllArticles(query: ArticleQueryDto): Promise<Article[]>{
        const { tag, author, favorited, limit, offset } = query;
        let queryBuilder = this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.tags', 'tags')
            .leftJoinAndSelect('article.author', 'author')
            .leftJoinAndSelect('author.profile', 'profile')
            .leftJoinAndSelect('profile.followers', 'follow')
            .leftJoinAndSelect('follow.follower', 'followerUser')  // 실제 팔로워인 user 로드
            .leftJoinAndSelect('article.favorites', 'favorite')
            .leftJoinAndSelect('favorite.user', 'favoriteUser')
            .leftJoin('favoriteUser.profile', 'favoriteProfile')

        // 필터링 조건을 순차적으로 추가
        if (tag) {
            queryBuilder.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('article.id')
                    .from('article', 'article')
                    .leftJoin('article.tags', 'tags')
                    .where('tags.name = :tag', { tag })
                    .getQuery();
                return 'article.id IN ' + subQuery;
            });
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
        return await queryBuilder.getMany();
    }

    async feed(followingUserIds:number[], query: PaginationDto){
        
        const { limit, offset } = query;

        return await this.articleRepository.find({
            where: { author: { id: In(followingUserIds) } },
            relations: ['author.profile.followers', 'tags', 'favorites.user'], // 'favorites' 제거
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
        });
        
    }

    async findArticleBySlug(slug: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: ['author.profile.followers', 'tags', 'favorites.user'], // 'favorites' 제거
        });
        if (!article) throw new NotFoundException('게시물을 찾을 수 없습니다.');
        return article;
    }

    async findBySlug(slug: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            where: { slug },
        });
        if (!article) throw new NotFoundException('게시물을 찾을 수 없습니다.');
        return article;
    }

    async findArticlesBySlugforComments(slug: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            where: {slug},
            relations:['comments','comments.user','comments.user.profile.followers']
        }) 
        if (!article) throw new NotFoundException('게시물을 찾을 수 없습니다.');
        return article;
    }

}
