import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  text,
  integer,
  jsonb,
  bigint,
  doublePrecision,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import {
  UserPlan,
  UserPermission,
  SubscriptionStatus,
  TermType,
  Region,
  Currency,
} from 'src/shared/enum/enum'

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
  plan: varchar('plan').$type<UserPlan>().notNull(),
  permissions: varchar('permissions')
    .array()
    .$type<UserPermission[]>()
    .notNull(),
  ...timestampColumns,
})

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  userAgreements: many(userAgreements),
  projects: many(projects),
}))

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  plan: varchar('plan').$type<UserPlan>().notNull(),
  status: varchar('status').$type<SubscriptionStatus>().notNull(),
  startedAt: timestamp('started_at', { mode: 'date' }).notNull(),
  endedAt: timestamp('ended_at', { mode: 'date' }).notNull(),
  cancelledAt: timestamp('cancelled_at', { mode: 'date' }),
  ...timestampColumns,
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}))

export const terms = pgTable('terms', {
  id: serial('id').primaryKey(),
  type: varchar('type').$type<TermType>().notNull().unique(),
  isRequired: boolean('is_required').notNull(),
  title: varchar('title').notNull(),
  content: text('content').notNull(),
  ...timestampColumns,
})

export const termsRelations = relations(terms, ({ many }) => ({
  userAgreements: many(userAgreements),
}))

export const userAgreements = pgTable('user_agreements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  termId: integer('term_id')
    .notNull()
    .references(() => terms.id),
  hasAgreed: boolean('has_agreed').notNull(),
  ...timestampColumns,
})

export const userAgreementsRelations = relations(userAgreements, ({ one }) => ({
  user: one(users, {
    fields: [userAgreements.userId],
    references: [users.id],
  }),
  term: one(terms, {
    fields: [userAgreements.termId],
    references: [terms.id],
  }),
}))

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name').notNull(),
  industryPath: varchar('industry_path').notNull(),
  ...timestampColumns,
})

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  ideas: many(ideas),
  analysisOverview: many(analysisOverview),
}))

export const ideas = pgTable('ideas', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id),
  problem: text('problem').notNull(),
  motivation: text('motivation').notNull(),
  features: text('features').notNull(),
  method: text('method').notNull(),
  deliverable: text('deliverable').notNull(),
  ...timestampColumns,
})

export const ideasRelations = relations(ideas, ({ one }) => ({
  project: one(projects, {
    fields: [ideas.projectId],
    references: [projects.id],
  }),
}))

export const analysisOverview = pgTable('analysis_overview', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id),
  summary: varchar('summary').notNull(),
  industryPath: varchar('industry_path').notNull(),
  review: varchar('review').notNull(),
  similarServicesScore: integer('similar_services_score').notNull(),
  limitationsScore: integer('limitations_score').notNull(),
  opportunitiesScore: integer('opportunities_score').notNull(),
  similarServices: jsonb('similar_services').$type<
    {
      description: string
      logoUrl: string
      websiteUrl: string
      tags: string[]
      summary: string
    }[]
  >(),
  supportPrograms: jsonb('support_programs').$type<
    {
      name: string
      organizer: string
      url: string
      startDate: Date
      endDate: Date
    }[]
  >(),
  targetMarkets: jsonb('target_markets').$type<
    {
      target: string
      iconUrl: string
      order: number
      reasons: string[]
      appeal: string[]
      onlineActivity: string[]
      onlineChannels: string[]
      offlineChannels: string[]
    }[]
  >(),
  marketingStrategies: jsonb('marketing_strategies').$type<
    {
      title: string
      details: {
        label: string
        description: string
      }[]
    }[]
  >(),
  businessModel: jsonb('business_model')
    .$type<{
      summary: string
      valueProp: {
        content: string
        details: {
          label: string
          description: string
        }[]
      }
      revenue: {
        label: string
        description: string
        details: string[]
      }[]
      investments: {
        order: number
        section: string
        details: {
          label: string
          description: string
        }[]
      }[]
    }>()
    .notNull(),
  opportunities: jsonb('opportunities').$type<
    {
      title: string
      description: string
    }[]
  >(),
  limitations: jsonb('limitations').$type<
    {
      category: string
      detail: string
      impact: string
      solution: string
    }[]
  >(),
  teamRequirements: jsonb('team_requirements').$type<
    {
      order: number
      role: string
      skills: string[]
      tasks: string[]
      salaryMin: number
      salaryMax: number
      currency: string
    }[]
  >(),
  ...timestampColumns,
})

export const analysisOverviewRelations = relations(
  analysisOverview,
  ({ one }) => ({
    project: one(projects, {
      fields: [analysisOverview.projectId],
      references: [projects.id],
    }),
  }),
)

export const marketStats = pgTable('market_stats', {
  id: serial('id').primaryKey(),
  industryPath: varchar('industry_path').notNull(),
  score: integer('score').notNull(),
  ...timestampColumns,
})

export const marketStatsRelations = relations(marketStats, ({ many }) => ({
  marketTrends: many(marketTrends),
  avgRevenues: many(avgRevenues),
}))

export const marketTrends = pgTable('market_trends', {
  id: serial('id').primaryKey(),
  marketStatsId: integer('market_stats_id')
    .notNull()
    .references(() => marketStats.id),
  region: varchar('region').$type<Region>().notNull(),
  year: integer('year').notNull(),
  volume: bigint('volume', { mode: 'number' }).notNull(),
  currency: varchar('currency').$type<Currency>().notNull(),
  growthRate: doublePrecision('growth_rate').notNull(),
  source: varchar('source').notNull(),
  ...timestampColumns,
})

export const marketTrendsRelations = relations(marketTrends, ({ one }) => ({
  marketStats: one(marketStats, {
    fields: [marketTrends.marketStatsId],
    references: [marketStats.id],
  }),
}))

export const avgRevenues = pgTable('avg_revenues', {
  id: serial('id').primaryKey(),
  marketStatsId: integer('market_stats_id')
    .notNull()
    .references(() => marketStats.id),
  region: varchar('region').$type<Region>().notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: varchar('currency').$type<Currency>().notNull(),
  source: varchar('source').notNull(),
  ...timestampColumns,
})

export const avgRevenuesRelations = relations(avgRevenues, ({ one }) => ({
  marketStats: one(marketStats, {
    fields: [avgRevenues.marketStatsId],
    references: [marketStats.id],
  }),
}))
