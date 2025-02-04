import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Profile } from '../profile/profile.entity';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.following)
  follower: User; // 팔로우하는 사용자

  @ManyToOne(() => Profile, (profile) => profile.followers)
  following: Profile; // 팔로우당하는 프로필
}
