import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Profile } from '../../profile.entity';

export class ProfileResponseDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsBoolean()
  following: boolean;

  static toDto(profile:Profile, id?:number) : ProfileResponseDto {
    let isFollow : boolean = false;
    if(id && profile.followers){
        isFollow = profile.followers.some(follow => follow.follower.id === id) 
    }

    return {
        username : profile.username,
        bio: profile.bio || '',
        image : profile.image || '',
        following:isFollow
    }
  }
}

export class ProfileWrapperDto {
  profile: ProfileResponseDto;
}