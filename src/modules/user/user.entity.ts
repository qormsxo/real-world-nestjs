import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Article } from '../article/article.entity';
import { Comment } from '../comment/comment.entity';
import { Profile } from '../profile/profile.entity';
import { UpdateUserPayload } from './dto/req/user.update.dto';
import { Follow } from '../follow/follow.entity';
import { Favorite } from '../favorite/favorite.entity';

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
  
  @OneToOne(() => Profile, (profile) => profile.user , { eager: true })
  profile: Profile;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[]; // 내가 팔로우하는 목록

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

    
  update(dto: UpdateUserPayload) {
    if (dto.email) this.email = dto.email; // 이메일이 있으면 변경    
    if (dto.password) this.password = dto.password; // 비밀번호가 있으면 변경
    
    // profile 관련 필드 업데이트
    if (dto.username) this.profile.username = dto.username; // 프로필 이름이 있으면 변경
    if (dto.bio !== undefined) this.profile.bio = dto.bio; // bio가 있으면 변경
    if (dto.image !== undefined) this.profile.image = dto.image; // 이미지가 있으면 변경
  }
}