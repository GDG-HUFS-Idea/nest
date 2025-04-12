import { User } from 'src/domain/user'
import { RdbClient } from 'src/shared/type/rdbClient.type'

export const USER_REPO = Symbol('USER_REPO')

export interface UserRepoPort {
  findOneById(param: { id: number; ctx?: RdbClient }): Promise<User | null>

  findOneByEmail(param: { email: string; ctx?: RdbClient }): Promise<User | null>

  saveOne(param: { user: User; ctx?: RdbClient }): Promise<User>
}
