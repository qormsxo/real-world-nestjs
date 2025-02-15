import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { BaseUserDto } from '../user.dto';
import { PickType } from '@nestjs/mapped-types';

export class UserLoginPayload extends PickType(BaseUserDto, ['email', 'password'] as const){}

export class UserLoginDto {
  @IsNotEmpty({ message: '사용자 정보(user)는 필수입니다.' })
  @ValidateNested()
  @Type(() => UserLoginPayload)
  user: UserLoginPayload;
}