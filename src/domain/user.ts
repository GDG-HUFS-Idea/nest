import { Permission, SubscriptionPlan } from 'src/shared/type/enum.type';
import { Subscription } from './subscription';
import { UserAgreement } from './userAgreement';

export class User {
  id?: number;
  email!: string;
  name!: string;
  plan!: SubscriptionPlan;
  permissions!: Permission[];
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  subscriptions?: Subscription[];
  userAgreements?: UserAgreement[];

  constructor(params: {
    email: string;
    name: string;
    plan: SubscriptionPlan;
    permissions: Permission[];
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    subscriptions?: Subscription[];
    userAgreements?: UserAgreement[];
  }) {
    this.email = params.email;
    this.name = params.name;
    this.plan = params.plan;
    this.permissions = params.permissions;
    this.id = params.id;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
    this.deletedAt = params.deletedAt;
    this.subscriptions = params.subscriptions;
    this.userAgreements = params.userAgreements;
  }
}
