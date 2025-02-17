import { IsNotEmpty,  ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseUserDto } from '../user.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UserCreateDto extends OmitType(BaseUserDto, ['bio', 'image'] as const) {}

export class UserCreateRequestDto {
  @IsNotEmpty({ message: '유저 객체는 필수 항목입니다.' })
  @ValidateNested() // 중첩 객체 유효성 검사 활성화
  @Type(() => UserCreateDto) // plain object → UserDto 변환
  user: UserCreateDto;
}