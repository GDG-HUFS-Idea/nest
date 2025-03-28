import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'
import { UserAgreement } from 'src/domain/userAgreement'

export const mapUserAgreement = (
  userAgreement: InferSelectModel<typeof schema.userAgreements>,
) =>
  new UserAgreement({
    id: userAgreement.id,
    userId: userAgreement.userId,
    termId: userAgreement.termId,
    hasAgreed: userAgreement.hasAgreed,
    createdAt: userAgreement.createdAt,
    updatedAt: userAgreement.updatedAt,
    deletedAt: userAgreement.deletedAt || undefined,
  })
