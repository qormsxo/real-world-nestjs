import { Injectable, NotFoundException, UnauthorizedException,  } from '@nestjs/common';
import {Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(email: string, password: string): Promise<User> {
        return this.userRepository.create({
            email,
            password
        })

    }
    async save(user:User): Promise<User> {
        return await this.userRepository.save(user)
    }

    async findByEmail(email:string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email }
        }) 
        if (!user) {
            throw new UnauthorizedException('이메일이 올바르지 않습니다.');
        }
        return user;

    }
    async findById(id: number): Promise<User> {
        return await this.userRepository.findOne({
            where: { id: id },
        }) || (() => { throw new NotFoundException(`유저를 찾을 수 없습니다.`); })();;
    }
}
