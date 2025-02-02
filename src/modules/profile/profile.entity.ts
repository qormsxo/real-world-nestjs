import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;  

  @Column({ nullable: true })
  bio: string;  

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => User, (user) => user.profiles)
  user: User;
}