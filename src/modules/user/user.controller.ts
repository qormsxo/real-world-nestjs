import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserResponseDto } from './dto/res/user.response.dto';
import { UserService } from './user.service';
import { UserDto } from './dto/req/user.dto';
import { CreateUserDto } from './dto/req/user.create.dto';


@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService
) {}

  @Post('/users')
  async SignUp(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { user } = createUserDto;  // user 객체를 뽑아서 사용
    return new UserResponseDto(
        await this.userService.signUp(user)
    );  
  }
}
