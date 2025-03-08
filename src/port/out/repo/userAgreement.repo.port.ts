import { UserAgreement } from 'src/domain/userAgreement'
import { RdbClient } from 'src/shared/type/rdbClient.type'

export const USER_AGREEMENT_REPO = Symbol('USER_AGREEMENT_REPO')

export interface UserAgreementRepoPort {
  findManyByUserId(param: {
    userId: number
    ctx?: RdbClient
  }): Promise<UserAgreement[] | null>

  saveMany(param: {
    userAgreements: UserAgreement[]
    ctx?: RdbClient
  }): Promise<UserAgreement[] | null>
}
