import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { UserCreateDto } from './dto/req/user.create.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto, UserWithTokenDto } from './dto/res/user.response.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdateUserDto } from './dto/req/user.update.dto';
import { UserLoginPayload } from './dto/req/user.login.dto';
import { ProfileRepository } from '../profile/profile.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,

        private readonly profileRepository: ProfileRepository,

        private jwtService: JwtService,
    ) { }

    @Transactional()
    async signUp(userDto: UserCreateDto): Promise<UserResponseDto> {

        const hashedPassword = await this.hashPassword(userDto.password)

        const user = await this.userRepository.create(userDto.email, hashedPassword)

        const savedUser = await this.userRepository.save(user)

        const profile = await this.profileRepository.create(
            userDto.username,
            savedUser
        )

        await this.profileRepository.save(profile);

        return {
            user: this.createUserResponse(savedUser)
        }
    }


    async signIn(userLoginPayload: UserLoginPayload): Promise<UserResponseDto> {
        const user = await this.userRepository.findByEmail(userLoginPayload.email);

        if (!user) {
            throw new UnauthorizedException('이메일이 올바르지 않습니다.');
        }

        const isPasswordValid = await bcrypt.compare(userLoginPayload.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
        }
        return {
            user :this.createUserResponse(user)
        }
    }
    async findById(id: number, token:string): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(id)
        
        return {
            user: UserWithTokenDto.builder()
                .setEmail(user.email)
                .setUsername(user.profile.username)
                .setBio(user.profile.bio)
                .setImage(user.profile.image)
                .setToken(token) // 요청에 온 토큰 그대로 넣어서 리턴 
                .build()
        }
    }
    async updateUser(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
        
        if (dto.user.password) dto.user.password = await this.hashPassword(dto.user.password)

        const user = await this.userRepository.findById(id)

        user.update(dto.user);
        // 엔티티를 저장 (업데이트)
        await this.userRepository.save(user);
        await this.profileRepository.save(user.profile)

        return {
            user: UserWithTokenDto.builder()
                .setEmail(user.email)
                .setUsername(user.profile.username)
                .setBio(user.profile.bio)
                .setImage(user.profile.image)
                .build()
        } 
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    private createUserResponse(user: User): UserWithTokenDto {
        const token = this.jwtService.sign({ id: user.id, email: user.email });

        return UserWithTokenDto.builder()
            .setEmail(user.email)
            .setUsername(user.profile?.username)
            .setBio(user.profile?.bio,)
            .setImage(user.profile?.image)
            .setToken(token)
            .build()
    }
}
