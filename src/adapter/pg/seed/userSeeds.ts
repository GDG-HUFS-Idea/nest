import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'
import { UserPermission, UserPlan } from 'src/shared/enum/enum'

export const userSeeds: InferInsertModel<typeof schema.users>[] = [
  {
    id: 1,
    email: 'admin@example.com',
    name: '관리자',
    plan: UserPlan.PRO,
    permissions: [UserPermission.ADMIN],
  },
  {
    id: 2,
    email: 'pro.user@example.com',
    name: '프로사용자',
    plan: UserPlan.PRO,
    permissions: [UserPermission.GENERAL],
  },
  {
    id: 3,
    email: 'free.user@example.com',
    name: '무료사용자',
    plan: UserPlan.FREE,
    permissions: [UserPermission.GENERAL],
  },
]
