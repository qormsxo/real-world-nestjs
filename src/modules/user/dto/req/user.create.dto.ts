import { IsNotEmpty } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto {
  @IsNotEmpty({ message: '유저 객체는 필수 항목입니다.' })
  user: UserDto;
}