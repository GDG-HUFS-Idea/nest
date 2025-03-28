import { UserPermission, UserPlan } from 'src/shared/enum/enum'
import { Subscription } from './subscription'
import { UserAgreement } from './userAgreement'

export class User {
  id?: number
  email!: string
  name!: string
  plan!: UserPlan
  permissions!: UserPermission[]
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  // relation
  subscriptions?: Subscription[]
  userAgreements?: UserAgreement[]

  constructor(param: {
    email: string
    name: string
    plan: UserPlan
    permissions: UserPermission[]
    id?: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
    subscriptions?: Subscription[]
    userAgreements?: UserAgreement[]
  }) {
    this.email = param.email
    this.name = param.name
    this.plan = param.plan
    this.permissions = param.permissions
    this.id = param.id
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
    this.subscriptions = param.subscriptions
    this.userAgreements = param.userAgreements
  }
}
