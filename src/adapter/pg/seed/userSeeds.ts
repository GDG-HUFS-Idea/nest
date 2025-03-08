import { InferInsertModel } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import { ENUM } from 'src/shared/const/enum.const'

export const userSeeds: InferInsertModel<typeof schema.users>[] = [
  {
    id: 1,
    name: '관리자_1',
    plan: ENUM.SUBSCRIPTION_PLAN.FREE,
    permissions: [ENUM.PERMISSION.ADMIN],
    email: 'admin1@example.com',
  },
  {
    id: 2,
    name: '사용자_1',
    plan: ENUM.SUBSCRIPTION_PLAN.FREE,
    permissions: [ENUM.PERMISSION.GENERAL],
    email: 'user1@example.com',
  },
  {
    id: 3,
    name: '사용자_2',
    plan: ENUM.SUBSCRIPTION_PLAN.FREE,
    permissions: [ENUM.PERMISSION.GENERAL],
    email: 'user2@example.com',
  },
]
