import { InferSelectModel } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import { Subscription } from 'src/domain/subscription'

export const mapSubscription = (
  subscription: InferSelectModel<typeof schema.subscriptions>,
) =>
  new Subscription({
    id: subscription.id,
    userId: subscription.userId,
    plan: subscription.plan,
    status: subscription.status,
    startedAt: subscription.startedAt,
    endedAt: subscription.endedAt,
    cancelledAt: subscription.cancelledAt || undefined,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    deletedAt: subscription.deletedAt || undefined,
  })
