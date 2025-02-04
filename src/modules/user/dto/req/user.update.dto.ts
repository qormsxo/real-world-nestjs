import { IsOptional, IsString, IsEmail } from 'class-validator';


export class UpdateUserDto {
  user:UpdateUserPayload
}

export class UpdateUserPayload{
    @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
