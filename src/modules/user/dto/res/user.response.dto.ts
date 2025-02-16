export class UserResponseDto {
  user: UserWithTokenDto
}

export class UserWithTokenDto{
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;

  constructor(
    email: string,
    username: string,
    bio: string | null,
    image: string | null,
    token: string,
  ) {
    this.email = email;
    this.username = username;
    this.bio = bio;
    this.image = image;
    this.token = token;
  }
  
  setToken(token:string) {
    this.token = token;
  }

  static builder(): UserWithTokenDtoBuilder {
    return new UserWithTokenDtoBuilder();
  }
}
// 빌더 패턴
export class UserWithTokenDtoBuilder {
  private email: string;
  private username: string;
  private bio: string | null;
  private image: string | null;
  private token: string;

  setEmail(email: string): UserWithTokenDtoBuilder {
    this.email = email;
    return this;
  }

  setUsername(username: string): UserWithTokenDtoBuilder {
    this.username = username;
    return this;
  }

  setBio(bio: string | null): UserWithTokenDtoBuilder {
    this.bio = bio;
    return this;
  }

  setImage(image: string | null): UserWithTokenDtoBuilder {
    this.image = image;
    return this;
  }

  setToken(token: string): UserWithTokenDtoBuilder {
    this.token = token;
    return this;
  }

  build(): UserWithTokenDto {
    return new UserWithTokenDto(this.email, this.username, this.bio, this.image, this.token);
  }
}
