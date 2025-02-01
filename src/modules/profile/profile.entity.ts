import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;  // 공개된 사용자명 (로그인과 별개)

  @Column({ nullable: true })
  bio: string;  // 사용자 소개

  @Column({ nullable: true })
  image: string;  // 프로필 이미지 URL

  @ManyToOne(() => User, (user) => user.profiles)
  user: User;  // User와의 관계
}