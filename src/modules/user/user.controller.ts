import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserResponseDto } from './dto/res/user.response.dto';
import { UserService } from './user.service';
import { UserDto } from './dto/req/user.create.dto';
import { CreateUserDto } from './dto/req/user.create.dto';
import { UserLoginDto } from './dto/req/user.login.dto';


@Controller('/users')
export class UserController {
  constructor(
    private readonly userService: UserService
) {}

  @Post('')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { user } = createUserDto;
    return new UserResponseDto(
        await this.userService.signUp(user)
    );  
  }
  @Post('/login')
  async logIn(@Body() loginDto : UserLoginDto): Promise<UserResponseDto> {
    const { user } = loginDto;
    return new UserResponseDto(
      await this.userService.signIn(user)
    )
  }
}
