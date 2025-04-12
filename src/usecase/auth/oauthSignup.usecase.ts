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
import { OauthSignupUsecaseRes, OauthSignupUsecasePort } from 'src/port/in/auth/oauthSignup.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { TRX_SERVICE } from 'src/port/out/service/trx.service.port'
import { USER_REPO, UserRepoPort } from 'src/port/out/repo/user.repo.port'
import { USER_AGREEMENT_REPO, UserAgreementRepoPort } from 'src/port/out/repo/userAgreement.repo.port'
import { getSignupTermTypes } from 'src/shared/helper/getSignupTermTypes'
import { OauthSignupUsecaseDto } from 'src/adapter/app/dto/auth/oauthSignup.usecase.dto'
import { UserPermission, UserPlan } from 'src/shared/enum/enum'

@Injectable()
export class OauthSignupUsecase implements OauthSignupUsecasePort {
  constructor(
    @Inject(USER_AGREEMENT_REPO)
    private readonly userAgreementRepo: UserAgreementRepoPort,
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
    @Inject(USER_REPO) private readonly userRepo: UserRepoPort,
    @Inject(TERM_REPO) private readonly termRepo: TermRepoPort,
    @Inject(TRX_SERVICE) private readonly trxService: TrxService,
    private readonly jwtService: JwtService,
  ) {}

  async exec(dto: OauthSignupUsecaseDto): Promise<OauthSignupUsecaseRes> {
    await this.validateAgreements(dto)

    const oauthUser = await this.verifyAndGetOauthUserCache(dto)
    const savedUser = await this.trxSaveUser(oauthUser, dto)

    const tokenUser = { id: savedUser!.id!, permissions: savedUser!.permissions }
    const token = this.jwtService.generate(tokenUser)

    return { token, user: tokenUser }
  }

  private async validateAgreements(dto: OauthSignupUsecaseDto) {
    const signUpTerms = await this.termRepo.findLatestByTypes({ types: getSignupTermTypes() }).catch(() => {
      throw new BadGatewayException()
    })

    if (!signUpTerms || signUpTerms.length === 0) {
      throw new BadGatewayException()
    }

    const agreementIds = dto.user_agreements.map((a) => a.term_id)
    const agreementIdsSet = new Set(agreementIds)

    // 중복 약관 ID 검사
    if (agreementIdsSet.size !== agreementIds.length) {
      throw new BadRequestException({ code: 1 })
    }

    // 필수 약관 개수 검사
    if (dto.user_agreements.length !== signUpTerms.length) {
      throw new BadRequestException({ code: 0 })
    }

    // 필수 약관 동의 검사
    for (const agreement of dto.user_agreements) {
      const requiredTerm = signUpTerms.find((term) => term.id === agreement.term_id)

      if (!requiredTerm) {
        throw new BadRequestException({ code: 0 })
      }

      if (requiredTerm.isRequired && !agreement.has_agreed) {
        throw new BadRequestException({ code: 1 })
      }
    }
  }

  private async verifyAndGetOauthUserCache(dto: OauthSignupUsecaseDto) {
    const oauthUser = await this.cacheRepo.getOauthUser({ key: dto.session_id }).catch(() => {
      throw new BadGatewayException()
    })
    if (!oauthUser) throw new NotFoundException()
    return oauthUser
  }

  private async trxSaveUser(oauthUser: OauthUser, dto: OauthSignupUsecaseDto) {
    return await this.trxService.startTrx(async (trx) => {
      const user = this.mapUser(oauthUser)

      const savedUser = await this.userRepo.saveOne({ user, ctx: trx }).catch(() => {
        throw new BadGatewayException()
      })

      const userAgreements = this.mapUserAgreements(dto, savedUser)

      await this.userAgreementRepo.saveMany({ userAgreements, ctx: trx }).catch(() => {
        throw new BadGatewayException()
      })

      return savedUser
    })
  }

  private mapUser(oauthUser: OauthUser) {
    return new User({
      email: oauthUser.email,
      name: oauthUser.name,
      permissions: [UserPermission.GENERAL],
      plan: UserPlan.FREE,
    })
  }

  private mapUserAgreements(dto: OauthSignupUsecaseDto, savedUser: User) {
    return dto.user_agreements.map(
      (agreement) =>
        new UserAgreement({
          userId: savedUser.id!,
          termId: agreement.term_id,
          hasAgreed: agreement.has_agreed,
        }),
    )
  }
}
