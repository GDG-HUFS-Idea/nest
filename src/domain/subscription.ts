import {
  SubscriptionPlan,
  SubscriptionStatus,
} from 'src/shared/type/enum.type';
import { User } from './user';

export class Subscription {
  id?: number;
  userId!: number;
  plan!: SubscriptionPlan;
  status!: SubscriptionStatus;
  startedAt!: Date;
  endedAt!: Date;
  cancelledAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  user?: User;

  constructor(params: {
    id?: number;
    userId: number;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startedAt: Date;
    endedAt: Date;
    cancelledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    user?: User;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.plan = params.plan;
    this.status = params.status;
    this.startedAt = params.startedAt;
    this.endedAt = params.endedAt;
    this.cancelledAt = params.cancelledAt;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
    this.deletedAt = params.deletedAt;
    this.user = params.user;
  }
}
