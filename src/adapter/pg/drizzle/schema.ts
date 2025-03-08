import {
  pgTable,
  timestamp,
  serial,
  varchar,
  integer,
  boolean,
  text,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import {
  Permission,
  SubscriptionPlan,
  SubscriptionStatus,
  TermType,
} from 'src/shared/type/enum.type'

const timestampColumns = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  name: varchar('name').notNull(),
  plan: varchar('plan').$type<SubscriptionPlan>().notNull(),
  permissions: varchar('permissions').array().$type<Permission[]>().notNull(),
  ...timestampColumns,
})

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  plan: varchar('plan').$type<SubscriptionPlan>().notNull(),
  status: varchar('status').$type<SubscriptionStatus>().notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at').notNull(),
  cancelledAt: timestamp('cancelled_at'),
  ...timestampColumns,
})

export const terms = pgTable('terms', {
  id: serial('id').primaryKey(),
  type: varchar('type').$type<TermType>().notNull(),
  title: varchar('title').notNull(),
  content: text('content').notNull(),
  isRequired: boolean('is_required').notNull(),
  ...timestampColumns,
})

export const userAgreements = pgTable('user_agreements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  termId: integer('term_id')
    .references(() => terms.id)
    .notNull(),
  hasAgreed: boolean('has_agreed').notNull(),
  ...timestampColumns,
})

export const userRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  userAgreements: many(userAgreements),
}))

export const subscriptionHistoryRelations = relations(
  subscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
  }),
)

export const termsRelations = relations(terms, ({ many }) => ({
  userAgreements: many(userAgreements),
}))

export const userAgreementRelations = relations(userAgreements, ({ one }) => ({
  user: one(users, {
    fields: [userAgreements.userId],
    references: [users.id],
  }),
  term: one(terms, {
    fields: [userAgreements.termId],
    references: [terms.id],
  }),
}))
