import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  username: varchar('username').notNull(),
  roles: varchar('roles').array().$type<Array<'general' | 'manager' | 'admin'>>().notNull(),
  subscriptionType: varchar('subscription_type').$type<'free' | 'pro'>().notNull(),
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  lastModifiedDate: timestamp('last_modified_date')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedDate: timestamp('deleted_date'),
});
