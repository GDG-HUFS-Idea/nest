import { Injectable } from '@nestjs/common'
import { UserAgreement } from 'src/domain/userAgreement'
import { UserAgreementRepoPort } from 'src/port/out/repo/userAgreement.repo.port'
import * as schema from '../drizzle/schema'
import { PgService } from '../pg.service'
import { mapUserAgreement } from '../mapper/mapUserAgreement'
import { RdbClient } from 'src/shared/type/rdbClient.type'

@Injectable()
export class UserAgreementRepo implements UserAgreementRepoPort {
  constructor(private readonly pgService: PgService) {}

  findManyByUserId(param: {
    userId: number
    ctx?: RdbClient
  }): Promise<UserAgreement[] | null> {
    throw new Error('Method not implemented.')
  }

  async saveMany(param: {
    userAgreements: UserAgreement[]
    ctx?: RdbClient
  }): Promise<UserAgreement[] | null> {
    if (param.userAgreements.length === 0) return null

    const ctx = param.ctx ?? this.pgService.getClient()

    const rows = await ctx
      .insert(schema.userAgreements)
      .values(param.userAgreements)
      .returning()

    return rows.map(mapUserAgreement)
  }
}
