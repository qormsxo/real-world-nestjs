import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from './dto/req/user.dto';
import * as bcrypt from 'bcrypt';
import { Profile } from '../profile/profile.entity';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto, UserWithTokenDto } from './dto/res/user.response.dto';
import { Transactional } from 'typeorm-transactional';

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
        return new UserWithTokenDto(savedUser.email, profile.username, profile.bio, profile.image, token);
          
    }
}
