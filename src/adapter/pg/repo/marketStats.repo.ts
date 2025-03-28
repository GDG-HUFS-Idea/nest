import { Injectable } from '@nestjs/common'
import { MarketStatsRepoPort } from 'src/port/out/repo/marketStats.repo.port'
import { PgService } from '../pg.service'
import { MarketStats } from 'src/domain/marketStats'
import { and, between, eq, isNull } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { mapMarketStats } from '../mapper/mapMarketStats'

@Injectable()
export class MarketStatsRepo implements MarketStatsRepoPort {
  constructor(private readonly pgService: PgService) {}

  async findOneByIndustryPath(param: {
    industryPath: string
    duration: number
    ctx?: RdbClient
  }): Promise<MarketStats | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const curYear = new Date().getFullYear()
    const fromYear = curYear - param.duration
    const toYear = curYear

    const row = await ctx.query.marketStats.findFirst({
      where: eq(schema.marketStats.industryPath, param.industryPath),
      with: {
        marketTrends: {
          where: and(
            between(schema.marketTrends.year, fromYear, toYear),
            isNull(schema.marketTrends.deletedAt),
          ),
        },
        avgRevenues: {
          where: isNull(schema.avgRevenues.deletedAt),
        },
      },
    })

    if (!row) return null

    return mapMarketStats(row, row.marketTrends, row.avgRevenues)
  }
}
