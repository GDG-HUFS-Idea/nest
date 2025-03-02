import { InferInsertModel } from 'drizzle-orm'
import * as schema from '../drizzle/schema'

export const userAgreementSeeds: InferInsertModel<
  typeof schema.userAgreements
>[] = [
  {
    id: 1,
    userId: 1,
    termId: 1,
    hasAgreed: true,
  },
  {
    id: 2,
    userId: 1,
    termId: 2,
    hasAgreed: true,
  },
  {
    id: 3,
    userId: 1,
    termId: 3,
    hasAgreed: true,
  },

  {
    id: 4,
    userId: 2,
    termId: 1,
    hasAgreed: true,
  },
  {
    id: 5,
    userId: 2,
    termId: 2,
    hasAgreed: true,
  },
  {
    id: 6,
    userId: 2,
    termId: 3,
    hasAgreed: false,
  },

  {
    id: 7,
    userId: 3,
    termId: 1,
    hasAgreed: true,
  },
  {
    id: 8,
    userId: 3,
    termId: 2,
    hasAgreed: true,
  },
  {
    id: 9,
    userId: 3,
    termId: 3,
    hasAgreed: true,
  },
]
