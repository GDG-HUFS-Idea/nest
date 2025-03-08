import { User } from 'src/domain/user'
import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'

export const mapUser = (user: InferSelectModel<typeof schema.users>): User => {
  return new User({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt || undefined,
  })
}
