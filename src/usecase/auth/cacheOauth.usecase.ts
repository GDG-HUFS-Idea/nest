import { BadGatewayException, Inject, Injectable } from '@nestjs/common'
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
    const code = this.generateUniqueCode()
    await this.cacheOauthUserInfo(code, oauthUser)

    return { code }
  }

  // 고유 코드 생성
  private generateUniqueCode() {
    return generateNanoId()
  }

  // OAuth 사용자 정보 캐싱
  private async cacheOauthUserInfo(code: string, oauthUser: OauthUser) {
    try {
      await this.cacheRepo.setOauthUser({
        key: code,
        oauthUser,
        ttl: 60, // 60초 유효
      })
    } catch {
      throw new BadGatewayException()
    }
  }
}
