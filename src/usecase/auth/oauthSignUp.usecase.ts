import {
  BadGatewayException,
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
import { Term } from 'src/domain/term'
import { getSignUpTermTypes } from 'src/shared/helper/getSignUpTermTypes'
import { Token } from 'src/shared/type/token.type'

@Injectable()
export class OauthSignUpUsecase implements OauthSignUpUsecasePort {
  constructor(
    @Inject(USER_AGREEMENT_REPO)
    private readonly userAgreementRepo: UserAgreementRepoPort,
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
    @Inject(USER_REPO) private readonly userRepo: UserRepoPort,
    @Inject(TERM_REPO) private readonly termRepo: TermRepoPort,
    @Inject(TRX_SERVICE) private readonly trxService: TrxService,
    private readonly jwtService: JwtService,
  ) {}

  async exec(dto: OauthSignUpUsecaseDto): Promise<OauthSignUpUsecaseRes> {
    const signUpTerms = await this.getSignUpTerms()
    this.validateDtoTerms(dto, signUpTerms)

    const oauthUser = await this.retrieveOauthUserInfo(dto.session_id)
    const savedUser = await this.createUserWithAgreements(oauthUser, dto)

    const user = this.extractUserForToken(savedUser)
    const token = this.generateToken(user)

    return {
      token,
      user,
    }
  }

  // 필수 약관 정보 조회
  private async getSignUpTerms() {
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

    return signUpTerms
  }

  // 세션 ID로 OAuth 사용자 정보 조회
  private async retrieveOauthUserInfo(sessionId: string): Promise<OauthUser> {
    let oauthUser: OauthUser | null
    try {
      oauthUser = await this.cacheRepo.getOauthUser({ key: sessionId })
    } catch {
      throw new BadGatewayException()
    }

    if (!oauthUser) {
      throw new NotFoundException()
    }

    return oauthUser
  }

  // 약관 동의 정보 검증
  private validateDtoTerms(dto: OauthSignUpUsecaseDto, signUpTerms: Term[]) {
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
  }

  // 유저 생성 및 약관 동의 정보 저장 (트랜잭션)
  private async createUserWithAgreements(
    oauthUser: OauthUser,
    dto: OauthSignUpUsecaseDto,
  ) {
    let savedUser: User

    await this.trxService.startTrx(async (trx) => {
      const user = this.createUserEntity(oauthUser)
      try {
        savedUser = await this.userRepo.saveOne({ user, ctx: trx })
      } catch {
        throw new BadGatewayException()
      }

      const userAgreements = this.createUserAgreementEntities(
        savedUser.id!,
        dto,
      )
      try {
        await this.userAgreementRepo.saveMany({ userAgreements, ctx: trx })
      } catch {
        throw new BadGatewayException()
      }

      return
    })

    return savedUser!
  }

  // 새 유저 엔티티 생성
  private createUserEntity(oauthUser: OauthUser) {
    return new User({
      email: oauthUser.email,
      name: oauthUser.name,
      permissions: [ENUM.PERMISSION.GENERAL], // 기본 권한
      plan: ENUM.SUBSCRIPTION_PLAN.FREE, // 무료 플랜
    })
  }

  // 약관 동의 엔티티 생성
  private createUserAgreementEntities(
    userId: number,
    dto: OauthSignUpUsecaseDto,
  ) {
    return dto.user_agreements.map(
      (userAgreement) =>
        new UserAgreement({
          userId: userId,
          termId: userAgreement.term_id,
          hasAgreed: userAgreement.has_agreed,
        }),
    )
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
}
