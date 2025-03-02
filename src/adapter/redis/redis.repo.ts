import { Injectable } from '@nestjs/common'
import { CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { RedisService } from './redis.service'

@Injectable()
export class RedisRepo implements CacheRepoPort {
  private readonly BASE_KEY_OAUTH_USER = 'oauthUser'

  constructor(private readonly redisService: RedisService) {}

  async setOauthUser(param: {
    key: string
    oauthUser: OauthUser
    ttl: number
  }): Promise<void> {
    await this.redisService
      .getClient()
      .setex(
        `${this.BASE_KEY_OAUTH_USER}:${param.key}`,
        param.ttl,
        JSON.stringify(param.oauthUser),
      )

    return
  }

  async getOauthUser(param: { key: string }): Promise<OauthUser | null> {
    const dataJson = await this.redisService
      .getClient()
      .get(`${this.BASE_KEY_OAUTH_USER}:${param.key}`)

    if (!dataJson) return null

    return JSON.parse(dataJson)
  }

  async deleteOauthUser(param: { key: string }): Promise<void> {
    await this.redisService
      .getClient()
      .del(`${this.BASE_KEY_OAUTH_USER}:${param.key}`)

    return
  }
}
