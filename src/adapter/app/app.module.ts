import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PgModule } from '../pg/pg.module'
import { JwtGuard } from './auth/jwt/jwt.guard'
import { JwtStrategy } from './auth/jwt/jwt.strategy'
import { PermissionsGuard } from './auth/permissions/permissions.guard'
import { AuthController } from './controller/auth.controller'
import { GoogleOauthStrategy } from './auth/oauth/googleOauth.strategy'
import { GoogleOauthGuard } from './auth/oauth/googleOauth.guard'
import { CACHE_OAUTH_USECASE } from 'src/port/in/auth/cacheOauth.usecase.port'
import { CacheOauthUsecase } from 'src/usecase/auth/cacheOauth.usecase'
import { TermController } from './controller/term.controller'
import { RedisModule } from '../redis/redis.module'
import { CALLBACK_OAUTH_USECASE } from 'src/port/in/auth/getOauthResult.usecase.port'
import { CallbackOauthUsecase } from 'src/usecase/auth/callbackOauth.usecase'
import { JwtService } from './auth/jwt/jwt.service'
import { OAUTH_SIGN_UP_USECASE } from 'src/port/in/auth/oauthSignUp.usecase.port'
import { OauthSignUpUsecase } from 'src/usecase/auth/oauthSignUp.usecase'
import { GET_TERMS_USECASE } from 'src/port/in/term/getTerms.usecase.port'
import { GetTermsUsecase } from 'src/usecase/term/getTerms.usecase'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),

    PgModule,
    RedisModule,
  ],

  controllers: [AuthController, TermController],

  providers: [
    GoogleOauthStrategy,
    GoogleOauthGuard,

    JwtStrategy,
    JwtGuard,
    JwtService,

    PermissionsGuard,

    { provide: CACHE_OAUTH_USECASE, useClass: CacheOauthUsecase },
    { provide: CALLBACK_OAUTH_USECASE, useClass: CallbackOauthUsecase },
    { provide: OAUTH_SIGN_UP_USECASE, useClass: OauthSignUpUsecase },
    { provide: GET_TERMS_USECASE, useClass: GetTermsUsecase },
  ],
})
export class AppModule {}
