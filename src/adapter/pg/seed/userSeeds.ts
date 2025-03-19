import { InferInsertModel } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import { UserPermission, UserPlan } from 'src/shared/enum/enum'

export const userSeeds: InferInsertModel<typeof schema.users>[] = [
  {
    id: 1,
    name: '관리자_1',
    plan: UserPlan.FREE,
    permissions: [UserPermission.ADMIN],
    email: 'admin1@example.com',
  },
  {
    id: 2,
    name: '사용자_1',
    plan: UserPlan.FREE,
    permissions: [UserPermission.GENERAL],
    email: 'user1@example.com',
  },
  {
    id: 3,
    name: '사용자_2',
    plan: UserPlan.FREE,
    permissions: [UserPermission.GENERAL],
    email: 'user2@example.com',
  },
]
