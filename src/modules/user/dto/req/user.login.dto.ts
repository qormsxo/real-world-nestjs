import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { BaseUserDto } from '../user.dto';

export class UserLoginDto extends BaseUserDto {
  @IsNotEmpty({ message: '사용자 정보(user)는 필수입니다.' })
  @ValidateNested() // 중첩된 객체 검증
  @Type(() => BaseUserDto) // 중첩 객체 변환
  user: BaseUserDto;
}