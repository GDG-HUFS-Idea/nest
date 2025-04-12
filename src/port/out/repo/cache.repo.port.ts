export const CACHE_REPO = Symbol('CACHE_REPO')

export interface CacheRepoPort {
  setOauthUser(param: { key: string; oauthUser: OauthUser; ttl: number }): Promise<void>

  getOauthUser(param: { key: string }): Promise<OauthUser | null>

  deleteOauthUser(param: { key: string }): Promise<void>

  setTask(param: {
    taskId: string
    userId: number
    task: null | { is_complete: boolean; result?: { project: { id: number; name: string } } }
    ttl: number
  }): Promise<void>

  getTask(param: {
    taskId: string
    userId: number
  }): Promise<null | { is_complete: boolean; result?: { project: { id: number; name: string } } }>

  deleteTask(param: { taskId: string; userId: number }): Promise<void>
}
