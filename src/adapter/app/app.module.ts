import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PgModule } from '../postgres/postgres.module';
import { GoogleOauth2Strategy } from './auth/oauth2/google/googleOauth2.strategy';
import { GoogleOauth2Guard } from './auth/oauth2/google/googleOauth2.guard';
import { JwtGuard } from './auth/jwt/jwt.guard';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { RolesGuard } from './auth/roles/roles.guard';
import { Ouath2Controller } from './controller/oauth2.controller';

@Module({
  // 현재 모듈에서 사용하려는 다른 모듈
  imports: [
    // 어떤 모듈에서든 configService를 주입받을 수 있도록
    ConfigModule.forRoot({ isGlobal: true }),

    // 환경변수를 관리하는 configService를 (동적으로) 주입받기 위한 registerAsync
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),

    PgModule,
  ],

  controllers: [Ouath2Controller],

  // 사용할 클래스들의 의존성 주입
  providers: [
    // 구글 oauth2 auth 모듈
    GoogleOauth2Strategy,
    GoogleOauth2Guard,

    // jwt auth 모듈
    JwtStrategy,
    JwtGuard,

    // roles auth 모듈
    RolesGuard,
  ],

  // 다른 모듈이 사용할 수 있도록 노출할 provider 정의
  exports: [],
})
export class AppModule {}
