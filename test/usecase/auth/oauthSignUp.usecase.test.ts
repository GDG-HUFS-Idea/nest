import { Test, TestingModule } from '@nestjs/testing'
import { OauthSignUpUsecase } from 'src/usecase/auth/oauthSignUp.usecase'
import {
  USER_AGREEMENT_REPO,
  UserAgreementRepoPort,
} from 'src/port/out/repo/userAgreement.repo.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { USER_REPO, UserRepoPort } from 'src/port/out/repo/user.repo.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { TRX_SERVICE } from 'src/port/out/service/trx.service.port'
import { TrxService } from 'src/adapter/pg/trx.service'
import { JwtService } from 'src/adapter/app/auth/jwt/jwt.service'
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { Term } from 'src/domain/term'
import { User } from 'src/domain/user'
import { TermType, UserPermission, UserPlan } from 'src/shared/enum/enum'
import { OauthSignUpUsecaseDto } from 'src/adapter/app/dto/auth/oauthSignUp.usecase.dto'

describe('OauthSignUpUsecase', () => {
  let usecase: OauthSignUpUsecase
  let userAgreementRepo: UserAgreementRepoPort
  let cacheRepo: CacheRepoPort
  let userRepo: UserRepoPort
  let termRepo: TermRepoPort
  let trxService: TrxService
  let jwtService: JwtService

  beforeEach(async () => {
    const mockUserAgreementRepo: UserAgreementRepoPort = {
      findManyByUserId: jest.fn(),
      saveMany: jest.fn(),
    }

    const mockCacheRepo: CacheRepoPort = {
      setOauthUser: jest.fn(),
      getOauthUser: jest.fn(),
      deleteOauthUser: jest.fn(),
    }

    const mockUserRepo: UserRepoPort = {
      findOneByEmail: jest.fn(),
      findOneById: jest.fn(),
      saveOne: jest.fn(),
    }

    const mockTermRepo: TermRepoPort = {
      findManyByIds: jest.fn(),
      findOneById: jest.fn(),
      findLatestByTypes: jest.fn(),
      saveOne: jest.fn(),
    }

    const mockTrxService = {
      startTrx: jest.fn((callback) => callback({})),
    }

    const mockJwtService = {
      generate: jest.fn(),
      verify: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OauthSignUpUsecase,
        {
          provide: USER_AGREEMENT_REPO,
          useValue: mockUserAgreementRepo,
        },
        {
          provide: CACHE_REPO,
          useValue: mockCacheRepo,
        },
        {
          provide: USER_REPO,
          useValue: mockUserRepo,
        },
        {
          provide: TERM_REPO,
          useValue: mockTermRepo,
        },
        {
          provide: TRX_SERVICE,
          useValue: mockTrxService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile()

    usecase = module.get<OauthSignUpUsecase>(OauthSignUpUsecase)
    userAgreementRepo = module.get<UserAgreementRepoPort>(USER_AGREEMENT_REPO)
    cacheRepo = module.get<CacheRepoPort>(CACHE_REPO)
    userRepo = module.get<UserRepoPort>(USER_REPO)
    termRepo = module.get<TermRepoPort>(TERM_REPO)
    trxService = module.get<TrxService>(TRX_SERVICE)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('정상적인 회원가입 처리', async () => {
    const sessionId = 'session-id-123'

    const mockOauthUser = {
      id: '12345',
      email: 'new@example.com',
      name: '신규 사용자',
      picture: 'http://example.com/avatar.jpg',
    }

    const mockTerms = [
      new Term({
        id: 1,
        type: TermType.TERMS_OF_SERVICE,
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
      }),
      new Term({
        id: 2,
        type: TermType.PRIVACY_POLICY,
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
      }),
      new Term({
        id: 3,
        type: TermType.MARKETING,
        title: '마케팅 정보 수신 동의',
        content: '마케팅 내용',
        isRequired: false,
      }),
    ]

    const mockSavedUser = new User({
      id: 1,
      email: 'new@example.com',
      name: '신규 사용자',
      permissions: [UserPermission.GENERAL],
      plan: UserPlan.FREE,
    })

    const mockToken = 'mock-jwt-token'

    const dto = {
      session_id: sessionId,
      user_agreements: [
        { term_id: 1, has_agreed: true },
        { term_id: 2, has_agreed: true },
        { term_id: 3, has_agreed: false },
      ],
    }

    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(mockTerms)
    jest.spyOn(cacheRepo, 'getOauthUser').mockResolvedValue(mockOauthUser)
    jest.spyOn(userRepo, 'saveOne').mockResolvedValue(mockSavedUser)
    jest.spyOn(userAgreementRepo, 'saveMany').mockResolvedValue([])
    jest.spyOn(jwtService, 'generate').mockReturnValue(mockToken)

    const result = await usecase.exec(dto)

    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })

    expect(cacheRepo.getOauthUser).toHaveBeenCalledWith({ key: sessionId })

    expect(trxService.startTrx).toHaveBeenCalled()

    expect(userRepo.saveOne).toHaveBeenCalledWith({
      user: expect.objectContaining({
        email: mockOauthUser.email,
        name: mockOauthUser.name,
        permissions: [UserPermission.GENERAL],
        plan: UserPlan.FREE,
      }),
      ctx: expect.anything(),
    })

    expect(userAgreementRepo.saveMany).toHaveBeenCalledWith({
      userAgreements: [
        expect.objectContaining({
          userId: mockSavedUser.id,
          termId: 1,
          hasAgreed: true,
        }),
        expect.objectContaining({
          userId: mockSavedUser.id,
          termId: 2,
          hasAgreed: true,
        }),
        expect.objectContaining({
          userId: mockSavedUser.id,
          termId: 3,
          hasAgreed: false,
        }),
      ],
      ctx: expect.anything(),
    })

    expect(jwtService.generate).toHaveBeenCalledWith({
      id: mockSavedUser.id,
      permissions: mockSavedUser.permissions,
    })

    expect(result).toEqual({
      token: mockToken,
      user: {
        id: mockSavedUser.id,
        permissions: mockSavedUser.permissions,
      },
    })
  })

  it('필수 약관에 동의하지 않은 경우 BadRequest 발생', async () => {
    const sessionId = 'session-id-123'

    const mockTerms = [
      new Term({
        id: 1,
        type: TermType.TERMS_OF_SERVICE,
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
      }),
      new Term({
        id: 2,
        type: TermType.PRIVACY_POLICY,
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
      }),
      new Term({
        id: 3,
        type: TermType.MARKETING,
        title: '마케팅 정보 수신 동의',
        content: '마케팅 내용',
        isRequired: false,
      }),
    ]

    const dto = {
      session_id: sessionId,
      user_agreements: [
        { term_id: 1, has_agreed: true },
        { term_id: 2, has_agreed: false }, // 필수 약관인데 동의하지 않음
        { term_id: 3, has_agreed: false },
      ],
    }

    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(mockTerms)

    await expect(usecase.exec(dto)).rejects.toThrow(BadRequestException)

    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })
  })

  it('약관 ID 중복이 있는 경우 BadRequest 발생', async () => {
    const sessionId = 'session-id-123'

    const mockTerms = [
      new Term({
        id: 1,
        type: TermType.TERMS_OF_SERVICE,
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
      }),
      new Term({
        id: 2,
        type: TermType.PRIVACY_POLICY,
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
      }),
      new Term({
        id: 3,
        type: TermType.MARKETING,
        title: '마케팅 정보 수신 동의',
        content: '마케팅 내용',
        isRequired: false,
      }),
    ]

    const dto = {
      session_id: sessionId,
      user_agreements: [
        { term_id: 1, has_agreed: true },
        { term_id: 2, has_agreed: true },
        { term_id: 2, has_agreed: true }, // 중복 ID
      ],
    }

    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(mockTerms)

    await expect(usecase.exec(dto)).rejects.toThrow(BadRequestException)

    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })
  })

  it('약관 개수가 불일치하는 경우 BadRequest 발생', async () => {
    const sessionId = 'session-id-123'

    const mockTerms = [
      new Term({
        id: 1,
        type: TermType.TERMS_OF_SERVICE,
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
      }),
      new Term({
        id: 2,
        type: TermType.PRIVACY_POLICY,
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
      }),
      new Term({
        id: 3,
        type: TermType.MARKETING,
        title: '마케팅 정보 수신 동의',
        content: '마케팅 내용',
        isRequired: false,
      }),
    ]

    const dto = {
      session_id: sessionId,
      user_agreements: [
        { term_id: 1, has_agreed: true },
        { term_id: 2, has_agreed: true },
        // 마케팅 동의 누락
      ],
    }

    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(mockTerms)

    await expect(usecase.exec(dto)).rejects.toThrow(BadRequestException)

    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })
  })

  it('약관 ID가 일치하지 않는 경우 BadRequest 발생', async () => {
    const sessionId = 'session-id-123'

    const mockTerms = [
      new Term({
        id: 1,
        type: TermType.TERMS_OF_SERVICE,
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
      }),
      new Term({
        id: 2,
        type: TermType.PRIVACY_POLICY,
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
      }),
      new Term({
        id: 3,
        type: TermType.MARKETING,
        title: '마케팅 정보 수신 동의',
        content: '마케팅 내용',
        isRequired: false,
      }),
    ]

    const dto = {
      session_id: sessionId,
      user_agreements: [
        { term_id: 1, has_agreed: true },
        { term_id: 2, has_agreed: true },
        { term_id: 999, has_agreed: false }, // 존재하지 않는 ID
      ],
    }

    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(mockTerms)

    await expect(usecase.exec(dto)).rejects.toThrow(BadRequestException)

    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })
  })

  it('세션 ID로 사용자를 찾을 수 없는 경우 NotFound 발생', async () => {
    const sessionId = 'invalid-session-id'

    const mockTerms = [
      new Term({
        id: 1,
        type: TermType.TERMS_OF_SERVICE,
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
      }),
      new Term({
        id: 2,
        type: TermType.PRIVACY_POLICY,
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
      }),
      new Term({
        id: 3,
        type: TermType.MARKETING,
        title: '마케팅 정보 수신 동의',
        content: '마케팅 내용',
        isRequired: false,
      }),
    ]

    const dto: OauthSignUpUsecaseDto = {
      session_id: sessionId,
      user_agreements: [
        { term_id: 1, has_agreed: true },
        { term_id: 2, has_agreed: true },
        { term_id: 3, has_agreed: false },
      ],
    }

    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(mockTerms)
    jest.spyOn(cacheRepo, 'getOauthUser').mockResolvedValue(null)

    await expect(usecase.exec(dto)).rejects.toThrow(NotFoundException)

    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })
    expect(cacheRepo.getOauthUser).toHaveBeenCalledWith({ key: sessionId })
  })

  it('필요한 약관을 찾을 수 없는 경우 InternalServerError 발생', async () => {
    const sessionId = 'session-id-123'

    const dto = {
      session_id: sessionId,
      user_agreements: [
        { term_id: 1, has_agreed: true },
        { term_id: 2, has_agreed: true },
        { term_id: 3, has_agreed: false },
      ],
    }

    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(null)

    await expect(usecase.exec(dto)).rejects.toThrow(
      InternalServerErrorException,
    )

    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })
  })
})
