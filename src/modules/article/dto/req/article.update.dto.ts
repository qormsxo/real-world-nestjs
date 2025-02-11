import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateArticleDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: '제목은 필수 항목입니다.' })
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    body?: string;
}


export class UpdateArticleRequestDto {
    @IsNotEmpty({ message: 'article 객체는 필수 항목입니다.' })
    @ValidateNested()
    @Type(() => UpdateArticleDto) // UpdateArticleDto로 변환
    article: UpdateArticleDto;
}