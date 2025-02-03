import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, ValidateNested } from 'class-validator';

export class UserLoginPayload {
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자리 이상이어야 합니다.' })
  password: string;
}

export class UserLoginDto {
  @IsNotEmpty({ message: '사용자 정보(user)는 필수입니다.' })
  @ValidateNested() // 중첩된 객체 검증
  @Type(() => UserLoginPayload) // 중첩 객체 변환
  user: UserLoginPayload;
}