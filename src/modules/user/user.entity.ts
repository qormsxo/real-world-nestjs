import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Article } from '../article/article.entity';
import { Comment } from '../comment/comment.entity';
import { Profile } from '../profile/profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
  
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}