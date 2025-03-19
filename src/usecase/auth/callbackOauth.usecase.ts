import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from 'src/adapter/app/auth/jwt/jwt.service'
import { CallbackOauthUsecaseDto } from 'src/adapter/app/dto/auth/callbackOauth.usecase.dto'
import { Term } from 'src/domain/term'
import { User } from 'src/domain/user'
import {
  CallbackOauthUsecaseRes,
  CallbackOauthUsecasePort,
} from 'src/port/in/auth/getOauthResult.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { USER_REPO, UserRepoPort } from 'src/port/out/repo/user.repo.port'
import { generateNanoId } from 'src/shared/helper/generateNanoId'
import { getSignUpTermTypes } from 'src/shared/helper/getSignUpTermTypes'
import { Token } from 'src/shared/type/token.type'

@Injectable()
export class CallbackOauthUsecase implements CallbackOauthUsecasePort {
  constructor(
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
    @Inject(USER_REPO) private readonly userRepo: UserRepoPort,
    @Inject(TERM_REPO) private readonly termRepo: TermRepoPort,
    private readonly jwtService: JwtService,
  ) {}

  async exec(dto: CallbackOauthUsecaseDto): Promise<CallbackOauthUsecaseRes> {
    const oauthUser = await this.retrieveOauthUserInfo(dto.code)
    const existingUser = await this.findExistingUser(oauthUser.email)

    return existingUser
      ? await this.handleLogin(existingUser, dto)
      : await this.prepareSignUp(oauthUser, dto)
  }

  // 인증 코드로 캐시에서 OAuth 사용자 정보를 조회
  private async retrieveOauthUserInfo(code: string): Promise<OauthUser> {
    const oauthUser = await this.cacheRepo
      .getOauthUser({ key: code })
      .catch(() => {
        throw new BadGatewayException()
      })

    if (!oauthUser) throw new NotFoundException()

    return oauthUser
  }

  // 이메일로 기존 사용자 조회
  private async findExistingUser(email: string): Promise<User | null> {
    try {
      return await this.userRepo.findOneByEmail({ email })
    } catch {
      throw new BadGatewayException()
    }
  }

  // 기존 사용자 처리 (로그인)
  private async handleLogin(
    existingUser: User,
    dto: CallbackOauthUsecaseDto,
  ): Promise<CallbackOauthUsecaseRes> {
    const user = this.extractUserForToken(existingUser)
    const token = this.generateToken(user)

    await this.cleanupOauthCache(dto.code)

    return {
      has_account: true,
      token,
      user,
    }
  }

  // 신규 사용자 처리 (회원가입 준비)
  private async prepareSignUp(
    oauthUser: OauthUser,
    dto: CallbackOauthUsecaseDto,
  ): Promise<CallbackOauthUsecaseRes> {
    const sessionId = this.generateSessionId()

    await this.cacheOauthUserWithSession(sessionId, oauthUser)
    const termIds = await this.getSignUpTermIds()

    await this.cleanupOauthCache(dto.code)

    return {
      has_account: false,
      session_id: sessionId,
      term_ids: termIds,
    }
  }

  // 토큰 생성에 필요한 사용자 정보 추출
  private extractUserForToken(user: User) {
    return {
      id: user.id!,
      permissions: user.permissions,
    }
  }

  // JWT 토큰 생성
  private generateToken(payload: Token) {
    return this.jwtService.generate(payload)
  }

  // 세션 ID 생성
  private generateSessionId(): string {
    return generateNanoId()
  }

  // OAuth 사용자 정보를 세션 ID로 캐싱
  private async cacheOauthUserWithSession(
    sessionId: string,
    oauthUser: OauthUser,
  ) {
    try {
      await this.cacheRepo.setOauthUser({
        key: sessionId,
        oauthUser,
        ttl: 60 * 15, // 15분 유효
      })
    } catch {
      throw new BadGatewayException()
    }
  }

  // 사용한 OAuth 인증 정보 캐시에서 삭제
  private async cleanupOauthCache(key: string) {
    try {
      await this.cacheRepo.deleteOauthUser({ key })
    } catch {
      throw new BadGatewayException()
    }
  }

  // 회원가입에 필요한 약관 ID 목록 조회
  private async getSignUpTermIds() {
    const types = getSignUpTermTypes()

    let signUpTerms: Term[] | null
    try {
      signUpTerms = await this.termRepo.findLatestByTypes({ types })
    } catch {
      throw new BadGatewayException()
    }

    if (!signUpTerms || signUpTerms.length === 0) {
      throw new InternalServerErrorException()
    }

    return signUpTerms.map((term) => term.id!)
  }
}
