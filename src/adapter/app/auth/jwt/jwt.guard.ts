import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 요청을 혀용 혹은 거부할지
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
