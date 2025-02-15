import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
// 공통 필드를 묶은 BaseUserDto
export class BaseUserDto {
    @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
    @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
    email: string;
  
    @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
    @MinLength(8, { message: '비밀번호는 최소 8자리 이상이어야 합니다.' })
    password: string;
  
    @IsNotEmpty({ message: '이름은 필수 항목입니다.' })
    @IsString()
    username: string;
  
    @IsOptional()
    @IsString()
    bio?: string;
  
    @IsOptional()
    @IsString()
    image?: string;
  }