import { SubscriptionStatus, UserPlan } from 'src/shared/enum/enum'
import { User } from './user'

export class Subscription {
  id?: number
  userId!: number
  plan!: UserPlan
  status!: SubscriptionStatus
  startedAt!: Date
  endedAt!: Date
  cancelledAt?: Date
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  // relation
  user?: User

  constructor(param: {
    id?: number
    userId: number
    plan: UserPlan
    status: SubscriptionStatus
    startedAt: Date
    endedAt: Date
    cancelledAt?: Date
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
    user?: User
  }) {
    this.id = param.id
    this.userId = param.userId
    this.plan = param.plan
    this.status = param.status
    this.startedAt = param.startedAt
    this.endedAt = param.endedAt
    this.cancelledAt = param.cancelledAt
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
    this.user = param.user
  }
}
