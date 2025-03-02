import { InferInsertModel } from 'drizzle-orm'
import * as schema from '../drizzle/schema'

export const userSeeds: InferInsertModel<typeof schema.users>[] = [
  {
    id: 1,
    name: '관리자_1',
    plan: 'free',
    permissions: ['admin'],
    email: 'admin1@example.com',
  },
  {
    id: 2,
    name: '사용자_1',
    plan: 'free',
    permissions: ['general'],
    email: 'user1@example.com',
  },
  {
    id: 3,
    name: '사용자_2',
    plan: 'free',
    permissions: ['general'],
    email: 'user2@example.com',
  },
]
