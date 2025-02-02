export class UserResponseDto {
  user: UserWithTokenDto

  constructor(
    user: UserWithTokenDto
  ){
    this.user = user;
  }
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
}

