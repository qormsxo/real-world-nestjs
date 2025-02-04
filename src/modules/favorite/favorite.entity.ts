import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  user: User; // 좋아요를 누른 사용자

  @ManyToOne(() => Article, (article) => article.favorites, { onDelete: 'CASCADE' })
  article: Article; // 좋아요된 아티클
}
