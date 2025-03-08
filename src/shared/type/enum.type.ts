import { ENUM } from '../const/enum.const'

export type Permission = (typeof ENUM.PERMISSION)[keyof typeof ENUM.PERMISSION]

export type SubscriptionPlan =
  (typeof ENUM.SUBSCRIPTION_PLAN)[keyof typeof ENUM.SUBSCRIPTION_PLAN]

export type TermType = (typeof ENUM.TERM_TYPE)[keyof typeof ENUM.TERM_TYPE]

export type SubscriptionStatus =
  (typeof ENUM.SUBSCRIPTION_STATUS)[keyof typeof ENUM.SUBSCRIPTION_STATUS]
