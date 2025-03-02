export const CACHE_REPO = Symbol('CACHE_REPO')

export interface CacheRepoPort {
  setOauthUser(param: {
    key: string
    oauthUser: OauthUser
    ttl: number
  }): Promise<void>
  getOauthUser(param: { key: string }): Promise<OauthUser | null>
  deleteOauthUser(param: { key: string }): Promise<void>
}
