import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEmail, ValidateNested } from 'class-validator';
import { BaseUserDto } from '../user.dto';

export class UpdateUserPayload extends PartialType(BaseUserDto){
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  image?: string;
}


export class UpdateUserDto {
  @ValidateNested()
  @Type(() => UpdateUserPayload) // user 속성의 타입 변환
  user: UpdateUserPayload; // user는 옵션으로 받음
}