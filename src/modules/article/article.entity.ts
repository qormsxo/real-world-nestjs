import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../user/user.entity';
import { Tag } from '../tag/tag.entity';
import { Comment } from '../comment/comment.entity';
import { Favorite } from '../favorite/favorite.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;  // 🔹 URL-friendly 제목 (예: "how-to-train-your-dragon")

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @ManyToMany(() => Tag, (tag) => tag.articles, { cascade: true })
  @JoinTable({ name: 'article_tags' })
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.article, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.article, { eager: true, cascade: true })
  favorites: Favorite[];

  @CreateDateColumn()
  createdAt: Date; // 🔹 생성 시간 자동 관리

  @UpdateDateColumn()
  updatedAt: Date; // 🔹 수정 시간 자동 관리

  constructor(
    title: string,
    slug: string,
    description: string,
    body: string,
    tags: Tag[],
    author: User,

  ) {
    this.title = title;
    this.slug = slug;
    this.description = description;
    this.body = body;
    this.tags = tags;
    this.author = author;
  }

  // 빌더 패턴을 위한 메서드
  static builder() {
    return new ArticleBuilder();
  }
}

// 빌더 클래스 정의
export class ArticleBuilder {
  private title: string;
  private slug: string;
  private description: string;
  private body: string;
  private tags: Tag[];
  private author: User;

  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  setSlug(slug: string): this {
    this.slug = slug;
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setBody(body: string): this {
    this.body = body;
    return this;
  }

  setTags(tags: Tag[]): this {
    this.tags = tags;
    return this;
  }

  setAuthor(author: User): this {
    this.author = author;
    return this;
  }

  // 최종적으로 Article 객체 반환
  build(): Article {
    return new Article(this.title, this.slug, this.description, this.body, this.tags, this.author)
  }
}