import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'

export const userAgreementSeeds: InferInsertModel<typeof schema.userAgreements>[] = [
  // 사용자 1의 약관 동의
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
  // 사용자 2의 약관 동의
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
  // 사용자 3의 약관 동의
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
