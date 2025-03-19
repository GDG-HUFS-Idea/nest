import { Test, TestingModule } from '@nestjs/testing'
import { CallbackOauthUsecase } from 'src/usecase/auth/callbackOauth.usecase'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { USER_REPO, UserRepoPort } from 'src/port/out/repo/user.repo.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { JwtService } from 'src/adapter/app/auth/jwt/jwt.service'
import { NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { User } from 'src/domain/user'
import { Term } from 'src/domain/term'
import * as nanoidModule from 'src/shared/helper/generateNanoId'
import { TermType, UserPermission, UserPlan } from 'src/shared/enum/enum'
import { CallbackOauthUsecaseDto } from 'src/adapter/app/dto/auth/callbackOauth.usecase.dto'

describe('CallbackOauthUsecase', () => {
  let usecase: CallbackOauthUsecase
  let cacheRepo: CacheRepoPort
  let userRepo: UserRepoPort
  let termRepo: TermRepoPort
  let jwtService: JwtService

  beforeEach(async () => {
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

    const mockJwtService = {
      generate: jest.fn(),
      verify: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallbackOauthUsecase,
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
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile()

    usecase = module.get<CallbackOauthUsecase>(CallbackOauthUsecase)
    cacheRepo = module.get<CacheRepoPort>(CACHE_REPO)
    userRepo = module.get<UserRepoPort>(USER_REPO)
    termRepo = module.get<TermRepoPort>(TERM_REPO)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('기존 사용자인 경우 로그인 처리', async () => {
    const authCode = 'auth-code-123'
    const mockOauthUser = {
      id: '12345',
      email: 'existing@example.com',
      name: '기존 사용자',
      picture: 'http://example.com/avatar.jpg',
    }

    const mockExistingUser = new User({
      id: 1,
      email: 'existing@example.com',
      name: '기존 사용자',
      permissions: [UserPermission.GENERAL],
      plan: UserPlan.FREE,
    })

    const mockToken = 'mock-jwt-token'

    jest.spyOn(cacheRepo, 'getOauthUser').mockResolvedValue(mockOauthUser)
    jest.spyOn(userRepo, 'findOneByEmail').mockResolvedValue(mockExistingUser)
    jest.spyOn(jwtService, 'generate').mockReturnValue(mockToken)

    const dto: CallbackOauthUsecaseDto = { code: authCode }

    const result = await usecase.exec(dto)

    expect(cacheRepo.getOauthUser).toHaveBeenCalledWith({ key: authCode })
    expect(userRepo.findOneByEmail).toHaveBeenCalledWith({
      email: mockOauthUser.email,
    })
    expect(jwtService.generate).toHaveBeenCalledWith({
      id: mockExistingUser.id,
      permissions: mockExistingUser.permissions,
    })
    expect(cacheRepo.deleteOauthUser).toHaveBeenCalledWith({ key: authCode })

    expect(result).toEqual({
      has_account: true,
      token: mockToken,
      user: {
        id: mockExistingUser.id,
        permissions: mockExistingUser.permissions,
      },
    })
  })

  it('신규 사용자인 경우 회원가입 준비', async () => {
    const authCode = 'auth-code-123'
    const sessionId = 'session-id-456'

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

    jest.spyOn(cacheRepo, 'getOauthUser').mockResolvedValue(mockOauthUser)
    jest.spyOn(userRepo, 'findOneByEmail').mockResolvedValue(null)
    jest.spyOn(nanoidModule, 'generateNanoId').mockReturnValue(sessionId)
    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(mockTerms)

    const dto: CallbackOauthUsecaseDto = { code: authCode }

    const result = await usecase.exec(dto)

    expect(cacheRepo.getOauthUser).toHaveBeenCalledWith({ key: authCode })
    expect(userRepo.findOneByEmail).toHaveBeenCalledWith({
      email: mockOauthUser.email,
    })
    expect(termRepo.findLatestByTypes).toHaveBeenCalledWith({
      types: [
        TermType.MARKETING,
        TermType.TERMS_OF_SERVICE,
        TermType.PRIVACY_POLICY,
      ],
    })
    expect(cacheRepo.setOauthUser).toHaveBeenCalledWith({
      key: sessionId,
      oauthUser: mockOauthUser,
      ttl: 60 * 15,
    })
    expect(cacheRepo.deleteOauthUser).toHaveBeenCalledWith({ key: authCode })

    expect(result).toEqual({
      has_account: false,
      session_id: sessionId,
      term_ids: [1, 2, 3],
    })
  })

  it('인증 코드로 사용자를 찾을 수 없는 경우 NotFound 발생', async () => {
    const authCode = 'invalid-auth-code'

    jest.spyOn(cacheRepo, 'getOauthUser').mockResolvedValue(null)

    const dto: CallbackOauthUsecaseDto = { code: authCode }

    await expect(usecase.exec(dto)).rejects.toThrow(NotFoundException)
    expect(cacheRepo.getOauthUser).toHaveBeenCalledWith({ key: authCode })
  })

  it('신규 사용자인데 필요한 약관을 찾을 수 없는 경우 InternalServerError 발생', async () => {
    const authCode = 'auth-code-123'
    const sessionId = 'session-id-456'

    const mockOauthUser = {
      id: '12345',
      email: 'new@example.com',
      name: '신규 사용자',
      picture: 'http://example.com/avatar.jpg',
    }

    jest.spyOn(cacheRepo, 'getOauthUser').mockResolvedValue(mockOauthUser)
    jest.spyOn(userRepo, 'findOneByEmail').mockResolvedValue(null)
    jest.spyOn(nanoidModule, 'generateNanoId').mockReturnValue(sessionId)
    jest.spyOn(termRepo, 'findLatestByTypes').mockResolvedValue(null)

    const dto: CallbackOauthUsecaseDto = { code: authCode }

    await expect(usecase.exec(dto)).rejects.toThrow(
      InternalServerErrorException,
    )
  })
})
