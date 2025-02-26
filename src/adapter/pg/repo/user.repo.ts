import { Injectable } from '@nestjs/common'
import { User } from 'src/domain/user'
import { UserRepoPort } from 'src/port/out/repo/user.repo.port'
import * as schema from '../drizzle/schema'
import { PgService } from '../pg.service'
import { and, eq, isNull } from 'drizzle-orm'
import { mapUser } from '../mapper/mapUser'
import { RdbClient } from 'src/shared/type/rdbClient.type'

@Injectable()
export class UserRepo implements UserRepoPort {
  constructor(private readonly pgService: PgService) {}
  findOneById(param: { id: number; ctx?: RdbClient }): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

  async findOneByEmail(param: {
    email: string
    ctx?: RdbClient
  }): Promise<User | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const row = await ctx.query.users.findFirst({
      where: and(
        eq(schema.users.email, param.email),
        isNull(schema.users.deletedAt),
      ),
    })

    if (!row) return null

    return mapUser(row)
  }

  async saveOne(param: { user: User; ctx: RdbClient }): Promise<User> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const [row] = await ctx.insert(schema.users).values(param.user).returning()

    return mapUser(row)
  }
}
