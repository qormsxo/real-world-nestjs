import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TagRepository } from './tag.repository';
import { TagReponseDto, TagsDto } from './dto/tag.response.dto';



@Injectable()
export class TagService {
    constructor(
        private readonly tagRepository: TagRepository,
    ) { }

    async getAllTags(): Promise<TagsDto>{
        const result = await this.tagRepository.getAllTags();
        return {
            tags : result.map((tag)=> TagReponseDto.toDto(tag))
        }
    }
}
