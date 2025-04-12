import { Injectable } from '@nestjs/common'
import { CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { RedisService } from './redis.service'

@Injectable()
export class RedisRepo implements CacheRepoPort {
  private readonly BASE_KEY_OAUTH_USER = 'oauthUser'
  private readonly BASE_KEY_TASK = 'task'

  constructor(private readonly redisService: RedisService) {}

  async setTask(param: {
    taskId: string
    userId: number
    task: null | {
      is_complete: boolean
      result?: {
        project: {
          id: number
          name: string
        }
      }
    }
    ttl: number
  }): Promise<void> {
    await this.redisService
      .getClient()
      .setex(`${this.BASE_KEY_TASK}:${param.userId}:${param.taskId}`, param.ttl, JSON.stringify(param.task))

    return
  }

  async getTask(param: { taskId: string; userId: number }): Promise<null | {
    is_complete: boolean
    result?: {
      project: {
        id: number
        name: string
      }
    }
  }> {
    const dataJson = await this.redisService.getClient().get(`${this.BASE_KEY_TASK}:${param.userId}:${param.taskId}`)

    if (!dataJson) return null

    return JSON.parse(dataJson)
  }

  async deleteTask(param: { taskId: string; userId: number }): Promise<void> {
    await this.redisService.getClient().del(`${this.BASE_KEY_TASK}:${param.userId}:${param.taskId}`)

    return
  }

  async setOauthUser(param: { key: string; oauthUser: OauthUser; ttl: number }): Promise<void> {
    await this.redisService
      .getClient()
      .setex(`${this.BASE_KEY_OAUTH_USER}:${param.key}`, param.ttl, JSON.stringify(param.oauthUser))

    return
  }

  async getOauthUser(param: { key: string }): Promise<OauthUser | null> {
    const dataJson = await this.redisService.getClient().get(`${this.BASE_KEY_OAUTH_USER}:${param.key}`)

    if (!dataJson) return null

    return JSON.parse(dataJson)
  }

  async deleteOauthUser(param: { key: string }): Promise<void> {
    await this.redisService.getClient().del(`${this.BASE_KEY_OAUTH_USER}:${param.key}`)

    return
  }
}
