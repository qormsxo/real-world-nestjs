import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from './dto/req/user.create.dto';
import * as bcrypt from 'bcrypt';
import { Profile } from '../profile/profile.entity';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto, UserWithTokenDto } from './dto/res/user.response.dto';
import { Transactional } from 'typeorm-transactional';
import { UserLoginPayload } from './dto/req/user.login.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Profile)
        private profileRepository: Repository<Profile>,

        private jwtService: JwtService, 
    ){}

    @Transactional()
    async signUp(userDto: UserDto) : Promise<UserWithTokenDto> {

        const salt = await bcrypt.genSalt(10); 

        const hashedPassword = await bcrypt.hash(userDto.password, salt);

        const user = this.userRepository.create({
            email: userDto.email,
            password: hashedPassword
        })

        const savedUser = await this.userRepository.save(user)

        const profile = this.profileRepository.create({
            username: userDto.username,
            user: savedUser
        });

        await this.profileRepository.save(profile);
        const payload = { id:savedUser.id, email: savedUser.email };
        const token = this.jwtService.sign(payload);
        return new UserWithTokenDto
        (
            savedUser.email,
            profile.username,
            profile.bio,
            profile.image,
            token
        );
          
    }


    async signIn(userLoginPayload: UserLoginPayload) : Promise<UserWithTokenDto>{
        const user = await this.userRepository.findOne({
            where:{email:userLoginPayload.email},
            relations:['profile']
        });
        if(!user){
            throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const isPasswordValid = await bcrypt.compare(userLoginPayload.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
        }

        const payload = { id: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return new UserWithTokenDto(
            user.email,
            user.profile.username,
            user.profile.bio,
            user.profile.image,
            token
        );
    }
}
