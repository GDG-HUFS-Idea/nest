import { UserAgreement } from 'src/domain/userAgreement'
import { RdbClient } from 'src/shared/type/rdbClient.type'

export const USER_AGREEMENT_REPO = Symbol('USER_AGREEMENT_REPO')

export interface UserAgreementRepoPort {
  saveMany(param: { userAgreements: UserAgreement[]; ctx?: RdbClient }): Promise<UserAgreement[]>
}
