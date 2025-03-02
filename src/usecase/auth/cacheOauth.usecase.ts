import { Inject, Injectable } from '@nestjs/common'
import {
  CacheOauthUsecaseRes,
  CacheOauthUsecasePort,
} from 'src/port/in/auth/cacheOauth.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { generateNanoId } from 'src/shared/helper/generateNanoId'

@Injectable()
export class CacheOauthUsecase implements CacheOauthUsecasePort {
  constructor(@Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort) {}

  async exec(oauthUser: OauthUser): Promise<CacheOauthUsecaseRes> {
    // 1. 고유 코드 생성
    const code = generateNanoId()

    // 2. OAuth 사용자 정보를 코드와 함께 캐시에 저장 (60초 유효)
    await this.cacheRepo.setOauthUser({
      key: code,
      oauthUser,
      ttl: 60,
    })

    // 3. 생성된 코드 반환 (이후 OAuth 콜백에서 사용됨)
    return { code }
  }
}
