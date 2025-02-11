import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ArrayUnique, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleCreateRequestBodyDto {
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

export class ArticleCreateRequestDto {
    @IsNotEmpty({ message: '게시물 객체는 필수 항목입니다.' })
    @ValidateNested()
    @Type(() => ArticleCreateRequestBodyDto)
    article: ArticleCreateRequestBodyDto;
}