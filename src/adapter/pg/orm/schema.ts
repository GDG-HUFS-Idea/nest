import {
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  username: varchar('username').notNull(),
  roles: varchar('roles')
    .array()
    .$type<Array<'general' | 'manager' | 'admin'>>()
    .notNull(),
  profileImgUrl: varchar('profile_img_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
});
