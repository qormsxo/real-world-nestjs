import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @Column("simple-array", { nullable: true })
  tagList: string[]; // 🔹 태그를 배열로 저장

  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.article)
  favorites: Favorite[];

  @CreateDateColumn()
  createdAt: Date; // 🔹 생성 시간 자동 관리

  @UpdateDateColumn()
  updatedAt: Date; // 🔹 수정 시간 자동 관리
}
