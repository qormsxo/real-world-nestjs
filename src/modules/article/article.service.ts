import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Transactional } from 'typeorm-transactional';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/req/article.create.dto';
import { Tag } from '../tag/tag.entity';
import { User } from '../user/user.entity';
import { ArticleDto, ArticleListDto, ArticlesDto, CreateArticleResponseDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,

        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    @Transactional()
    async createArticle(createArticleDto: CreateArticleDto, id: number): Promise<CreateArticleResponseDto> {
        const { title, description, body, tagList } = createArticleDto;

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

        const articleDto: ArticleDto = ArticleDto.toDto(article);

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

    async getAllArticles(query: ArticleQueryDto, id?: number): Promise<ArticleListDto[]> {

        const { tag, author, favorited, limit, offset } = query;
        // 기본 쿼리로 필터링 없이 데이터를 먼저 가져옴
        let queryBuilder = this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .leftJoinAndSelect('author.profile', 'profile')
            .leftJoinAndSelect('article.tags', 'tags');

        // 필터링 조건을 순차적으로 추가
        if (tag) {
            queryBuilder.andWhere('tags.name = :tag', { tag });
        }

        if (author) {
            queryBuilder.andWhere('profile.username = :author', { author });
        }

        if (favorited) {
            queryBuilder
                .leftJoin('article.favorites', 'favorite')
                .leftJoin('favorite.user', 'favoriteUser')
                .leftJoin('favoriteUser.profile', 'favoriteProfile')
                .andWhere('favoriteProfile.username = :favorited', { favorited });
        }

        // 필터링된 데이터를 기준으로 limit, offset을 적용
        queryBuilder
            .skip(offset)
            .take(limit)
            .orderBy('article.createdAt', 'DESC');

        // 결과 쿼리 실행
        const articles = await queryBuilder.getMany();


        return articles.map((article) => ArticleListDto.toDto(article, id))
    }


}
