import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ArrayUnique, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsString({ each: true }) // 배열 요소가 문자열인지 검사
    tagList: string[];
}

export class CreateArticleRequestDto {
    @ValidateNested()
    @Type(() => CreateArticleDto) // Transform을 위한 데코레이터
    article: CreateArticleDto;
}
