import { BadRequestException, Body, Controller, Get, Post, Put, Req, Request, UseGuards } from '@nestjs/common';
import { UserResponseDto } from './dto/res/user.response.dto';
import { UserService } from './user.service';
import { UserCreateRequestDto } from './dto/req/user.create.dto';
import { UserLoginDto } from './dto/req/user.login.dto';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { UpdateUserDto } from './dto/req/user.update.dto';


@Controller('')
export class UserController {
  constructor(
    private readonly userService: UserService
) {}

  @Post('/users')
  async signUp(@Body() createUserReqDto: UserCreateRequestDto): Promise<UserResponseDto> {
    const { user } = createUserReqDto;
    return new UserResponseDto(
        await this.userService.signUp(user)
    );  
  }
  @Post('/users/login')
  async logIn(@Body() loginDto : UserLoginDto): Promise<UserResponseDto> {
    const { user } = loginDto;
    return new UserResponseDto(
      await this.userService.signIn(user)
    )
  }
  @Get('/user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() req): Promise<UserResponseDto>{

    const token = req.headers.authorization?.split(' ')[1];  // "Bearer <token>"에서 토큰만 추출
    const user = await this.userService.findById(req.user.id);  // 유저 정보 찾기
    user.setToken(token)
    return new UserResponseDto(
      user
    )
  }
  @Put('/user')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Request() req){
    const token = req.headers.authorization?.split(' ')[1];  // "Bearer <token>"에서 토큰만 추출

    const user = await this.userService.updateUser(req.user.id,updateUserDto);  // 유저 정보 찾기
    user.setToken(token)
    return new UserResponseDto(
      user
    )
  }
}
