import { InferInsertModel } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import { SubscriptionStatus, UserPlan } from 'src/shared/enum/enum'

export const subscriptionSeeds: InferInsertModel<typeof schema.subscriptions>[] = [
  {
    id: 1,
    userId: 1,
    plan: UserPlan.PRO,
    status: SubscriptionStatus.ACTIVE,
    startedAt: new Date('2025-01-01'),
    endedAt: new Date('2026-01-01'),
  },
  {
    id: 2,
    userId: 2,
    plan: UserPlan.PRO,
    status: SubscriptionStatus.ACTIVE,
    startedAt: new Date('2025-01-15'),
    endedAt: new Date('2026-01-15'),
  },
]
