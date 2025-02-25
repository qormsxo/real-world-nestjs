import { Injectable, } from '@nestjs/common';
import {Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagRepository {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) {}

    async getAllTags(): Promise<Tag[]>{
        return await this.tagRepository.find()
    }

}
