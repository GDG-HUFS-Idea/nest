import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from 'src/adapter/app/auth/jwt/jwt.service'
import { CallbackOauthUsecaseDto } from 'src/adapter/app/dto/auth/callbackOauth.usecase.dto'
import { CallbackOauthUsecaseRes, CallbackOauthUsecasePort } from 'src/port/in/auth/getOauthResult.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { USER_REPO, UserRepoPort } from 'src/port/out/repo/user.repo.port'
import { generateNanoId } from 'src/shared/helper/generateNanoId'
import { getSignupTermTypes } from 'src/shared/helper/getSignupTermTypes'

@Injectable()
export class CallbackOauthUsecase implements CallbackOauthUsecasePort {
  constructor(
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
    @Inject(USER_REPO) private readonly userRepo: UserRepoPort,
    @Inject(TERM_REPO) private readonly termRepo: TermRepoPort,
    private readonly jwtService: JwtService,
  ) {}

  async exec(dto: CallbackOauthUsecaseDto): Promise<CallbackOauthUsecaseRes> {
    const oauthUser = await this.verifyAndGetOauthUser(dto)
    const existingUser = await this.getExistingUser(oauthUser)

    // 기존 사용자일 경우 로그인 처리
    if (existingUser) {
      const tokenUser = { id: existingUser.id!, permissions: existingUser.permissions }
      const token = this.jwtService.generate(tokenUser)
      await this.deleteOauthUserCache(dto)

      return {
        has_account: true,
        token,
        user: tokenUser,
      }
    }
    // 신규 유저일 경우 회원가입 처리
    else {
      const sessionId = generateNanoId()
      const termIds = await this.getSignupTermIds()

      await this.setNewOauthUserCache(sessionId, oauthUser)
      await this.deleteOldOauthUserCache(dto)

      return {
        has_account: false,
        session_id: sessionId,
        term_ids: termIds,
      }
    }
  }

  private async getExistingUser(oauthUser: OauthUser) {
    return await this.userRepo.findOneByEmail({ email: oauthUser.email }).catch(() => {
      throw new BadGatewayException()
    })
  }

  private async deleteOldOauthUserCache(dto: CallbackOauthUsecaseDto) {
    await this.cacheRepo.deleteOauthUser({ key: dto.code }).catch(() => {
      throw new BadGatewayException()
    })
  }

  private async setNewOauthUserCache(sessionId: string, oauthUser: OauthUser) {
    await this.cacheRepo
      .setOauthUser({
        key: sessionId,
        oauthUser,
        ttl: 60 * 15, // 15분
      })
      .catch(() => {
        throw new BadGatewayException()
      })
  }

  private async deleteOauthUserCache(dto: CallbackOauthUsecaseDto) {
    await this.cacheRepo.deleteOauthUser({ key: dto.code }).catch(() => {
      throw new BadGatewayException()
    })
  }

  private async verifyAndGetOauthUser(dto: CallbackOauthUsecaseDto) {
    const oauthUser = await this.cacheRepo.getOauthUser({ key: dto.code }).catch(() => {
      throw new BadGatewayException()
    })

    if (!oauthUser) throw new NotFoundException()

    return oauthUser
  }

  private async getSignupTermIds() {
    const signUpTerms = await this.termRepo.findLatestByTypes({ types: getSignupTermTypes() }).catch(() => {
      throw new BadGatewayException()
    })

    if (!signUpTerms || signUpTerms.length === 0) {
      throw new InternalServerErrorException()
    }

    return signUpTerms.map((term) => term.id!)
  }
}
