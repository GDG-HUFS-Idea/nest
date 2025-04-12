import { Body, Controller, Get, HttpCode, Inject, Post, Query, Redirect, UseGuards } from '@nestjs/common'
import { GoogleOauthGuard } from '../auth/oauth/googleOauth.guard'
import { CACHE_OAUTH_USECASE, CacheOauthUsecasePort } from 'src/port/in/auth/cacheOauth.usecase.port'
import { OauthUser } from '../paramDecorator/oauthUser.decorator'
import { CALLBACK_OAUTH_USECASE, CallbackOauthUsecasePort } from 'src/port/in/auth/getOauthResult.usecase.port'
import { OAUTH_SIGNUP_USECASE, OauthSignupUsecasePort } from 'src/port/in/auth/oauthSignup.usecase.port'
import { CallbackOauthUsecaseDto } from '../dto/auth/callbackOauth.usecase.dto'
import { OauthSignupUsecaseDto } from '../dto/auth/oauthSignup.usecase.dto'

@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(CACHE_OAUTH_USECASE)
    private readonly cacheHasAccount: CacheOauthUsecasePort,
    @Inject(CALLBACK_OAUTH_USECASE)
    private readonly callbackOauthUsecase: CallbackOauthUsecasePort,
    @Inject(OAUTH_SIGNUP_USECASE)
    private readonly oauthSignupUsecase: OauthSignupUsecasePort,
  ) {}

  @Get('/oauth/google')
  @Redirect()
  @UseGuards(GoogleOauthGuard)
  async cacheHasGoogleAccount(@OauthUser() oauthUser: OauthUser) {
    const result = await this.cacheHasAccount.exec(oauthUser)

    return {
      url: `http://localhost:3000/redirect?${new URLSearchParams(result).toString()}`,
      statusCode: 302,
    }
  }

  @Get('/oauth/callback')
  async callbackOauth(@Query() dto: CallbackOauthUsecaseDto) {
    const result = await this.callbackOauthUsecase.exec(dto)

    return result
  }

  @Post('/oauth/signup')
  @HttpCode(200)
  async oauthSignUp(@Body() dto: OauthSignupUsecaseDto) {
    const result = await this.oauthSignupUsecase.exec(dto)

    return result
  }
}
