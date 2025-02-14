// import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Profile } from '../../profile.entity';

export class ProfileResponseDto {
  username: string;
  bio?: string;
  image?: string;
  following: boolean;

  static toDto(profile:Profile, id?:number) : ProfileResponseDto {
    
    let isFollow = false;
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