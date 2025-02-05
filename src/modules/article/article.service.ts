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

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,

        @InjectRepository(Tag)
        private TagRepository: Repository<Tag>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ){}

    @Transactional() 
    async createArticle(createArticleDto: CreateArticleDto , id: number): Promise<CreateArticleResponseDto>{
        const { title, description, body, tagList } = createArticleDto; 

        // 프로필 정보를 가져오기 위해 relations 옵션 추가
        const author = await this.userRepository.findOne({
            where: { id: id },
            relations: ['profile'], // 여기 추가!
        })
        || 
        (() => { throw new NotFoundException(`유저를 찾을 수 없습니다.`); })();
        
        //Article 생성
        const article = this.articleRepository.create({
            title,
            slug: this.generateSlug(title),
            description,
            body,
            author,
        });
        //Promise all 로 전부 병렬 처리
        const tags = await Promise.all(
            // 맵을 순환하면서 태그추가
            tagList.map(async (tagName)=>{
                let tag = await this.TagRepository.findOneBy({name:tagName});
                //존재하지 않는 태그면 추가
                if(!tag){
                    tag = this.TagRepository.create({name:tagName})
                    await this.TagRepository.save(tag)
                }
                return tag
            })
        )

        article.tags = tags;
        await this.articleRepository.save(article);

        let articleDto:ArticleDto = ArticleDto.toDto(article);

        return {
            article: articleDto
        };
    }
    generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async getAllArticles(): Promise<ArticleListDto[]>{
        let articles : Article[] = await this.articleRepository.find({
            select: ['slug', 'title', 'description', 'createdAt', 'updatedAt'], // 'body' 제외
            relations: ['author', 'author.profile','tags'],
        });
        return articles.map((article)=> ArticleListDto.toDto(article))
    }
    

}
