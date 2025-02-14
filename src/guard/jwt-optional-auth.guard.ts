import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    // Authorization 헤더가 있으면 인증 절차 진행
    if (authorizationHeader) {
      return super.canActivate(context);
    }

    // Authorization 헤더가 없으면 인증을 건너뜀
    return true;
  }
}