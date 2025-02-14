import { IsEmail, IsNotEmpty, MinLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseUserDto } from '../user.dto';

export class UserCreateDto extends BaseUserDto{
  @IsNotEmpty({ message: '이름은 필수 항목입니다.' })
  username: string;
}

export class UserCreateRequestDto {
  @IsNotEmpty({ message: '유저 객체는 필수 항목입니다.' })
  @ValidateNested() // 중첩 객체 유효성 검사 활성화
  @Type(() => UserCreateDto) // plain object → UserDto 변환
  user: UserCreateDto;
}
