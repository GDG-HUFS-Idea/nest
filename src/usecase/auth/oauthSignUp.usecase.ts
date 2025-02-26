import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from 'src/adapter/app/auth/jwt/jwt.service'
import { TrxService } from 'src/adapter/pg/trx.service'
import { User } from 'src/domain/user'
import { UserAgreement } from 'src/domain/userAgreement'
import {
  OauthSignUpUsecaseDto,
  OauthSignUpUsecaseRes,
  OauthSignUpUsecasePort,
} from 'src/port/in/auth/oauthSignUp.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { TRX_SERVICE } from 'src/port/out/service/trx.service.port'
import { USER_REPO, UserRepoPort } from 'src/port/out/repo/user.repo.port'
import {
  USER_AGREEMENT_REPO,
  UserAgreementRepoPort,
} from 'src/port/out/repo/userAgreement.repo.port'
import { ENUM } from 'src/shared/const/enum.const'

@Injectable()
export class OauthSignUpUsecase implements OauthSignUpUsecasePort {
  constructor(
    @Inject(USER_AGREEMENT_REPO)
    private readonly userAgreementRepo: UserAgreementRepoPort, //
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
    @Inject(USER_REPO) private readonly userRepo: UserRepoPort,
    @Inject(TERM_REPO) private readonly termRepo: TermRepoPort,
    @Inject(TRX_SERVICE) private readonly trxService: TrxService,
    private readonly jwtService: JwtService,
  ) {}

  async exec(dto: OauthSignUpUsecaseDto): Promise<OauthSignUpUsecaseRes> {
    // 1. 가입 시 필요한 약관 정보 조회
    const signUpTerms = await this.termRepo.findLatestByTypes({
      types: [
        ENUM.TERM_TYPE.MARKETING,
        ENUM.TERM_TYPE.TERMS_OF_SERVICE,
        ENUM.TERM_TYPE.PRIVACY_POLICY,
      ],
    })
    if (!signUpTerms) throw new InternalServerErrorException()

    // 2. 사용자 약관 동의 정보 검증
    const agreementIds = dto.user_agreements.map((a) => a.term_id)
    const agreementIdsSet = new Set(agreementIds)

    // 약관 ID 중복 오류
    if (agreementIdsSet.size !== agreementIds.length)
      throw new BadRequestException({ code: 1 })

    // 가입 시 필요한 약관 개수 불일치 오류
    if (dto.user_agreements.length !== signUpTerms.length)
      throw new BadRequestException({ code: 0 })

    for (const agreement of dto.user_agreements) {
      const requiredTerm = signUpTerms.find(
        (term) => term.id === agreement.term_id,
      )

      // 가입 시 필요한 약관 ID 불일치 오류
      if (!requiredTerm) throw new BadRequestException({ code: 0 })

      // 가입 시 필요한 약관 미동의 오류
      if (requiredTerm.isRequired && !agreement.has_agreed)
        throw new BadRequestException({ code: 1 })
    }

    // 3. 세션 ID로 OAuth 사용자 정보 조회
    const oauthUser = await this.cacheRepo.getOauthUser({ key: dto.session_id })
    if (!oauthUser) throw new NotFoundException()

    let savedUser: User

    // 4. 트랜잭션으로 사용자 및 약관 동의 정보 저장
    await this.trxService.startTrx(async (trx) => {
      const user = new User({
        email: oauthUser.email,
        name: oauthUser.name,
        permissions: [ENUM.PERMISSION.GENERAL], // 기본 권한
        plan: ENUM.SUBSCRIPTION_PLAN.FREE, // 무료 플랜
      })
      savedUser = await this.userRepo.saveOne({ user, ctx: trx })

      const userAgreements = dto.user_agreements.map(
        (userAgreement) =>
          new UserAgreement({
            userId: savedUser.id!,
            termId: userAgreement.term_id,
            hasAgreed: userAgreement.has_agreed,
          }),
      )
      await this.userAgreementRepo.saveMany({ userAgreements, ctx: trx })

      return
    })

    // 5. JWT 토큰 생성 및 반환
    const user = {
      id: savedUser!.id!,
      permissions: savedUser!.permissions,
    }
    const token = this.jwtService.generate(user)

    return {
      token,
      user,
    }
  }
}
