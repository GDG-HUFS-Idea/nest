import { Test, TestingModule } from '@nestjs/testing'
import { CacheOauthUsecase } from 'src/usecase/auth/cacheOauth.usecase'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import * as nanoidModule from 'src/shared/helper/generateNanoId'

describe('CacheOauthUsecase', () => {
  let usecase: CacheOauthUsecase
  let cacheRepo: CacheRepoPort

  beforeEach(async () => {
    const mockCacheRepo: CacheRepoPort = {
      setOauthUser: jest.fn(),
      getOauthUser: jest.fn(),
      deleteOauthUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheOauthUsecase,
        {
          provide: CACHE_REPO,
          useValue: mockCacheRepo,
        },
      ],
    }).compile()

    usecase = module.get<CacheOauthUsecase>(CacheOauthUsecase)
    cacheRepo = module.get<CacheRepoPort>(CACHE_REPO)
  })

  it('OAuth 사용자 정보 캐싱 및 코드 반환', async () => {
    const mockCode = 'test-nano-id'
    jest.spyOn(nanoidModule, 'generateNanoId').mockReturnValue(mockCode)

    const mockOauthUser = {
      id: '12345',
      email: 'test@example.com',
      name: '테스트 사용자',
      picture: 'http://example.com/avatar.jpg',
    }

    const result = await usecase.exec(mockOauthUser)

    expect(cacheRepo.setOauthUser).toHaveBeenCalledWith({
      key: mockCode,
      oauthUser: mockOauthUser,
      ttl: 60,
    })
    expect(result).toEqual({ code: mockCode })
  })
})
