import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from 'src/adapter/app/auth/jwt/jwt.service'
import {
  CallbackOauthUsecaseDto,
  CallbackOauthUsecaseRes,
  CallbackOauthUsecasePort,
} from 'src/port/in/auth/getOauthResult.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { USER_REPO, UserRepoPort } from 'src/port/out/repo/user.repo.port'
import { ENUM } from 'src/shared/const/enum.const'
import { generateNanoId } from 'src/shared/helper/generateNanoId'

@Injectable()
export class CallbackOauthUsecase implements CallbackOauthUsecasePort {
  constructor(
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
    @Inject(USER_REPO) private readonly userRepo: UserRepoPort,
    @Inject(TERM_REPO) private readonly termRepo: TermRepoPort,
    private readonly jwtService: JwtService,
  ) {}

  async exec(dto: CallbackOauthUsecaseDto): Promise<CallbackOauthUsecaseRes> {
    // 1. 인증 코드로 캐시에서 OAuth 사용자 정보 조회
    const oauthUser = await this.cacheRepo.getOauthUser({ key: dto.code })
    if (!oauthUser) throw new NotFoundException()

    // 2. 이메일로 기존 사용자 조회
    const existingUser = await this.userRepo.findOneByEmail({
      email: oauthUser.email,
    })

    if (existingUser) {
      // 3A. 기존 사용자가 있는 경우 - 로그인 처리
      const user = {
        id: existingUser!.id!,
        permissions: existingUser!.permissions,
      }
      // JWT 토큰 생성
      const token = this.jwtService.generate(user)

      // 사용한 인증 정보 삭제
      await this.cacheRepo.deleteOauthUser({ key: dto.code })
      return {
        has_account: true,
        token,
        user,
      }
    } else {
      // 3B. 신규 사용자인 경우 - 회원가입 준비
      // 세션 ID 생성
      const sessionId = generateNanoId()

      // OAuth 사용자 정보 새 세션 ID로 캐싱 (15분 유효)
      await this.cacheRepo.setOauthUser({
        key: sessionId,
        oauthUser,
        ttl: 60 * 15,
      })

      // 가입 시 필요한 약관 목록 조회
      const signUpTerms = await this.termRepo.findLatestByTypes({
        types: [
          ENUM.TERM_TYPE.MARKETING,
          ENUM.TERM_TYPE.TERMS_OF_SERVICE,
          ENUM.TERM_TYPE.PRIVACY_POLICY,
        ],
      })
      if (!signUpTerms) throw new InternalServerErrorException()

      const termIds = signUpTerms.map((term) => term.id!)

      // 사용한 인증 정보 삭제
      await this.cacheRepo.deleteOauthUser({ key: dto.code })

      return {
        has_account: false,
        session_id: sessionId,
        term_ids: termIds,
      }
    }
  }
}
