import { Tag } from "../tag.entity";


export class TagReponseDto{
    name: string
    static toDto(tag:Tag): TagReponseDto{
        return {
            name: tag.name
        }
    }
}


export class TagsDto {
    tags: TagReponseDto[];
}