import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Transactional } from 'typeorm-transactional';
import { Article } from './article.entity';
import { ArticleCreateRequestBodyDto } from './dto/req/article.create.dto';
import { Tag } from '../tag/tag.entity';
import { User } from '../user/user.entity';
import { ArticleResponseDto, ArticlesDto, ArticleCreateResponseDto } from './dto/res/article.response.dto';
import { ArticleQueryDto } from './dto/req/article.query.dto';
import { Follow } from '../follow/follow.entity';
import { PaginationDto } from 'src/shared/dto/pagenation.dto';
import { UpdateArticleDto } from './dto/req/article.update.dto';
import { Favorite } from '../favorite/favorite.entity';
import { CommentCreateDto } from '../comment/dto/req/comment.create.dto';
import { ArticleRepository } from './article.repository';
// import { Comment } from '../comment/comment.entity';
// import { CommentResponseDto, CommentsDto } from '../comment/dto/res/comment.response.dto';

@Injectable()
export class ArticleService {
    constructor(
        
        private readonly articleRepository : ArticleRepository,

        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,

        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
    ) { }

    @Transactional()
    async createArticle(dto: ArticleCreateRequestBodyDto, id: number): Promise<ArticleCreateResponseDto> {
        const { title, description, body, tagList } = dto;

        const author = await this.articleRepository.getUserById(id)
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
    async getAllArticles(query: ArticleQueryDto, id?: number): Promise<ArticleResponseDto[]> {

        const articles = await this.articleRepository.getAllArticles(query);

        return articles.map((article) => ArticleResponseDto.toDto(article, id))
    }

    // 내가 팔로우 한 사람의 게시글 목록 페이징
    async feed(id: number, query: PaginationDto) {

        // 팔로우 하고 있는 사람 조회 
        const followingUsers = await this.followRepository.find({
            where: { follower: { id } },
            relations: ['following.user'],
        })
        // 팔로우 하고 있는 사람들의 userid 추출
        const followingUserIds = followingUsers.map(follow => follow.following.user.id)


        const articles = await this.articleRepository.feed(followingUserIds,query)

        return articles.map((article) => ArticleResponseDto.toDto(article, id))

    }

    public async findArticleBySlug(slug: string): Promise<Article> {
        return await this.articleRepository.findArticleBySlug(slug)
    }

    // 슬러그로 게시글 조회
    async findBySlug(slug: string): Promise<ArticleResponseDto> {
        const article = await this.articleRepository.findArticleBySlug(slug)

        return ArticleResponseDto.toDto(article)
    }

    // 게시글 업데이트 
    @Transactional()
    async updateBySlug(id: number, slug: string, dto: UpdateArticleDto): Promise<ArticleResponseDto> {
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

        return ArticleResponseDto.toDto(article, id)
    }


    @Transactional()
    async favoriteArticle(id: number, slug: string): Promise<ArticleResponseDto> {
        const article = await this.findArticleBySlug(slug);

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
    async unFavoriteArticle(id: number, slug: string): Promise<ArticleResponseDto> {
        const article = await this.findArticleBySlug(slug);

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

    // async createComment(id: number, slug: string, dto: CommentCreateDto): Promise<CommentResponseDto> {
    //     const article = await this.findArticleBySlug(slug);

    //     const commentedUser = await this.getUserById(id);

    //     console.log(article.author.profile);

    //     const comment = this.commentRepository.create({
    //         article,
    //         body: dto.body,
    //         user: commentedUser
    //     })
    //     const savedComment = await this.commentRepository.save(comment);

    //     return CommentResponseDto.toDto(savedComment, id)
    // }


    async findArticlesBySlugforComments( slug: string): Promise<Article> {
        const article = await this.articleRepository.findArticlesBySlugforComments(slug)
        return article;
    }


    // @Transactional()
    // async deleteCommentsById(id: number, commentId: number, slug: string): Promise<void> {
    //     await this.findBySlug(slug);

    //     const comment = await this.commentRepository.findOne({
    //         where: {
    //             id: commentId,
    //             article: { slug: slug }
    //         },
    //         relations: ['article', 'user'] // article, user 조인
    //     }) 
    //     if (!comment)  throw new NotFoundException('찾을 수 없는 댓글입니다.');
    //     if (comment.user.id !== id) throw new ForbiddenException('작성자가 아닙니다.');
        
    //     await this.commentRepository.remove(comment);
        
    // }


}
