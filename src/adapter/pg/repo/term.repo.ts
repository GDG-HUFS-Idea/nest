import { Injectable } from '@nestjs/common'
import { Term } from 'src/domain/term'
import { TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { TermType } from 'src/shared/type/enum.type'
import * as schema from '../drizzle/schema'
import { PgService } from '../pg.service'
import { and, inArray, isNull, max } from 'drizzle-orm'
import { mapTerm } from '../mapper/mapTerm'
import { RdbClient } from 'src/shared/type/rdbClient.type'

@Injectable()
export class TermRepo implements TermRepoPort {
  constructor(private readonly pgService: PgService) {}

  findOneById(param: { id: number; ctx?: RdbClient }): Promise<Term | null> {
    throw new Error('Method not implemented.')
  }

  async findManyByIds(param: {
    ids: number[]
    ctx?: RdbClient
  }): Promise<Term[] | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const rows = await ctx.query.terms.findMany({
      where: and(
        inArray(schema.terms.id, param.ids),
        isNull(schema.terms.deletedAt),
      ),
    })

    if (!rows) return null

    return rows.map(mapTerm)
  }

  async findLatestByTypes(param: {
    types: TermType[]
    ctx?: RdbClient
  }): Promise<Term[] | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const rows = await ctx
      .select()
      .from(schema.terms)
      .where(
        inArray(
          schema.terms.id,
          ctx
            .select({ id: max(schema.terms.id) })
            .from(schema.terms)
            .where(
              and(
                inArray(schema.terms.type, param.types),
                isNull(schema.terms.deletedAt),
              ),
            )
            .groupBy(schema.terms.type),
        ),
      )

    if (rows.length === 0) return null

    return rows.map(mapTerm)
  }

  saveOne(param: { term: Term; ctx?: RdbClient }): Promise<Term> {
    throw new Error('Method not implemented.')
  }
}
