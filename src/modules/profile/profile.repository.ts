import { Injectable, NotFoundException, } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfileRepository {
    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) { }

    async getProfileWithFollowers(username: string): Promise<Profile> {
        return await this.profileRepository.findOne({
            where: { username },
            relations: ['followers'],
        }) || (() => { throw new NotFoundException('프로필을 찾을 수 없습니다.') })();
    }

    async save(profile: Profile): Promise<Profile> {
        return await this.profileRepository.save(profile);
    }

    async create(username: string, user: User): Promise<Profile> {
        return this.profileRepository.create({
            username,
            user
        })
    }

}
