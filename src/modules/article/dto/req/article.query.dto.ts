import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../shared/dto/pagenation.dto';

export class ArticleQueryDto extends PaginationDto{
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  favorited?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
