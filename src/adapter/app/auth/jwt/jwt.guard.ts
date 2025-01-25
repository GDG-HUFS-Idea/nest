import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// "언제" 인증을 적용할지
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
