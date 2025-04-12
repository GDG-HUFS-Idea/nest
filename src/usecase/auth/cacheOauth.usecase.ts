import { BadGatewayException, Inject, Injectable } from '@nestjs/common'
import { CacheOauthUsecaseRes, CacheOauthUsecasePort } from 'src/port/in/auth/cacheOauth.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { generateNanoId } from 'src/shared/helper/generateNanoId'

@Injectable()
export class CacheOauthUsecase implements CacheOauthUsecasePort {
  constructor(@Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort) {}

  async exec(oauthUser: OauthUser): Promise<CacheOauthUsecaseRes> {
    const code = generateNanoId()
    await this.setOauthUserCache(code, oauthUser)
    return { code }
  }

  private async setOauthUserCache(code: string, oauthUser: OauthUser) {
    await this.cacheRepo
      .setOauthUser({
        key: code,
        oauthUser,
        ttl: 60, // 60초
      })
      .catch(() => {
        throw new BadGatewayException()
      })
  }
}
