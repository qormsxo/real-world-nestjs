import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ArrayUnique, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CommentCreateDto {
    @IsString()
    @IsNotEmpty()
    body: string;
}

export class CommentCreateRequestDto {
    @IsNotEmpty({ message: '댓글 객체는 필수 항목입니다.' })
    @ValidateNested()
    @Type(() => CommentCreateDto)
    comment: CommentCreateDto;
}