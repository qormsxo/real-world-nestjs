import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
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

  @OneToOne(() => User, (user) => user.profile) 
  @JoinColumn() // 🔥 여기 추가! Profile 테이블이 User의 외래 키(FK)를 가짐
  user: User;
}