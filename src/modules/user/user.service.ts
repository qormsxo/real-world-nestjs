import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/req/user.create.dto';
import * as bcrypt from 'bcrypt';
import { Profile } from '../profile/profile.entity';
import { JwtService } from '@nestjs/jwt';
import { UserWithTokenDto } from './dto/res/user.response.dto';
import { Transactional } from 'typeorm-transactional';
import { UserLoginPayload } from './dto/req/user.login.dto';
import { UpdateUserDto } from './dto/req/user.update.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Profile)
        private profileRepository: Repository<Profile>,

        private jwtService: JwtService,
    ) { }

    @Transactional()
    async signUp(userDto: CreateUserDto): Promise<UserWithTokenDto> {

        const hashedPassword = await this.hashPassword(userDto.password)

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

        return this.createUserResponse(savedUser);
    }


    async signIn(userLoginPayload: UserLoginPayload): Promise<UserWithTokenDto> {
        const user = await this.userRepository.findOne({
            where: { email: userLoginPayload.email },
            relations: ['profile']
        });

        if (!user) {
            throw new UnauthorizedException('이메일이 올바르지 않습니다.');
        }

        const isPasswordValid = await bcrypt.compare(userLoginPayload.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
        }
        return this.createUserResponse(user);
    }
    async findById(id: number): Promise<UserWithTokenDto> {
        const user = await this.userRepository.findOneOrFail({
            where: { id: id },
            relations: ['profile'], // 'profile'을 함께 가져오기
        });
        
        

        return UserWithTokenDto.builder()
            .setEmail(user.email)
            .setUsername(user.profile.username)
            .setBio(user.profile.bio)
            .setImage(user.profile.image)
            .build();
    }
    async updateUser(id: number, dto: UpdateUserDto): Promise<UserWithTokenDto> {
        
        if (dto.user.password) dto.user.password = await this.hashPassword(dto.user.password)

        const user = await this.userRepository.findOneOrFail({
            where: { id: id },
            relations: ['profile'], // 'profile'을 함께 가져오기
        });        

        user.update(dto.user);
        // 엔티티를 저장 (업데이트)
        await this.userRepository.save(user);
        await this.profileRepository.save(user.profile)

        return UserWithTokenDto.builder()
            .setEmail(user.email)
            .setUsername(user.profile.username)
            .setBio(user.profile.bio)
            .setImage(user.profile.image)
            .build();
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    private createUserResponse(user: User): UserWithTokenDto {
        const token = this.jwtService.sign({ id: user.id, email: user.email });
    
        return new UserWithTokenDto(
          user.email,
          user.profile?.username,
          user.profile?.bio,
          user.profile?.image,
          token,
        );
    }
}
