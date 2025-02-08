import { Controller, Get, Param, Post, Request, UseGuards, } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/auth.guard';
import { FollowService } from './follow.service';
import { ProfileWrapperDto } from '../profile/dto/res/profile.response.dto';



@Controller('profiles')
export class FollowController {
    constructor(
        private readonly followService: FollowService,
    ) { }

    @Post(':username/follow')
    @UseGuards(JwtAuthGuard)
    async follow(
        @Param('username') username: string,
        @Request() req,
    ) : Promise<ProfileWrapperDto> {
        return await this.followService.follow(username,req.user.id);
    }

    @Get(':username')
    @UseGuards(JwtAuthGuard)
    async getProfile(
        @Param('username') username: string,
        @Request() req,
    ) : Promise<ProfileWrapperDto> {
        console.log(username);
        
        return await this.followService.getProfile(username,req.user.id);
    }


}
