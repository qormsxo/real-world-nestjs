import { IsEmail, IsNotEmpty, MinLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자리 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: '비밀번호는 최소 하나의 문자와 숫자를 포함해야 합니다.',
  })
  password: string;

  @IsNotEmpty({ message: '이름은 필수 항목입니다.' })
  username: string;
}

export class CreateUserRequestDto {
  @IsNotEmpty({ message: '유저 객체는 필수 항목입니다.' })
  @ValidateNested() // 중첩 객체 유효성 검사 활성화
  @Type(() => CreateUserDto) // plain object → UserDto 변환
  user: CreateUserDto;
}
