export const CACHE_OAUTH_USECASE = Symbol('CACHE_OAUTH_USECASE')

export interface CacheOauthUsecasePort {
  exec(oauthUser: OauthUser): Promise<CacheOauthUsecaseRes>
}

export type CacheOauthUsecaseRes = {
  code: string
}
