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
import { APP_FILTER } from '@nestjs/core'
import { BadRequestFilter } from './filter/badRequest.filter'
import { GlobalFilter } from './filter/global.filter'
import { GetAnalysisOverviewUsecase } from 'src/usecase/project/getAnalysisOverview.usecase'
import { GetMyProjectListUsecase } from 'src/usecase/project/getMyProjectList.usecase'
import { GET_ANALYSIS_OVERVIEW_USECASE } from 'src/port/in/project/getAnalysisOverview.usecase.port'
import { GET_MY_PROJECT_LIST_USECASE } from 'src/port/in/project/getMyProjectList.usecase.port'
import { ProjectController } from './controller/project.controller'
import { AnalyzeIdeaUsecase } from 'src/usecase/project/analyzeIdea.usecase'
import { WatchAnalysisStatusUsecase } from 'src/usecase/project/watchAnalysisStatus.usecase'
import { ANALYZE_IDEA_USECASE } from 'src/port/in/project/analyzeIdea.usecase.port'
import { WATCH_ANALYSIS_STATUS_USECASE } from 'src/port/in/project/watchAnalysisStatus.usecase.port'
import { AiModule } from '../ai/ai.module'
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
    AiModule,
  ],

  controllers: [AuthController, TermController, ProjectController],

  providers: [
    { provide: APP_FILTER, useClass: GlobalFilter }, // 두번째 필터링
    { provide: APP_FILTER, useClass: BadRequestFilter }, // 첫번째 필터링

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
    {
      provide: GET_ANALYSIS_OVERVIEW_USECASE,
      useClass: GetAnalysisOverviewUsecase,
    },
    { provide: GET_MY_PROJECT_LIST_USECASE, useClass: GetMyProjectListUsecase },
    { provide: ANALYZE_IDEA_USECASE, useClass: AnalyzeIdeaUsecase },
    {
      provide: WATCH_ANALYSIS_STATUS_USECASE,
      useClass: WatchAnalysisStatusUsecase,
    },
  ],
})
export class AppModule {}
