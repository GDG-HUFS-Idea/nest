import { Injectable } from '@nestjs/common'
import { MarketStatsRepoPort } from 'src/port/out/repo/marketStats.repo.port'
import { PgService } from '../pg.service'
import * as schema from '../drizzle/schema'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { and, eq, isNull, between, sql, inArray, or, InferSelectModel } from 'drizzle-orm'
import { MarketStats } from 'src/domain/marketStats'
import { mapMarketStats } from '../mapper/mapMarketStats'
import { Region } from 'src/shared/enum/enum'

@Injectable()
export class MarketStatsRepo implements MarketStatsRepoPort {
  constructor(private readonly pgService: PgService) {}

  async findOneByIndustryPath(param: {
    industryPath: string
    fromYear: number
    toYear: number
    ctx?: RdbClient
  }): Promise<MarketStats | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const result = await ctx.query.marketStats.findFirst({
      where: and(eq(schema.marketStats.industryPath, param.industryPath), isNull(schema.marketStats.deletedAt)),
      with: {
        marketTrends: {
          where: and(
            isNull(schema.marketTrends.deletedAt),
            between(schema.marketTrends.year, param.fromYear, param.toYear),
          ),
        },
        avgRevenues: {
          where: isNull(schema.avgRevenues.deletedAt),
        },
      },
    })

    if (!result || result.marketTrends.length !== 2 * (param.toYear - param.fromYear + 1)) return null

    return mapMarketStats(result, result.marketTrends, result.avgRevenues)
  }

  async saveOne(param: { marketStats: MarketStats; ctx?: RdbClient }): Promise<MarketStats> {
    const ctx = param.ctx ?? this.pgService.getClient()

    return await ctx.transaction(async (trxCtx) => {
      // market stats
      await trxCtx
        .update(schema.marketStats)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(schema.marketStats.industryPath, param.marketStats.industryPath),
            isNull(schema.marketStats.deletedAt),
          ),
        )

      const savedMarketStats = (await trxCtx.insert(schema.marketStats).values(param.marketStats).returning())[0]

      // market trends
      await trxCtx
        .update(schema.marketTrends)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(schema.marketTrends.marketStatsId, savedMarketStats.id),
            isNull(schema.marketTrends.deletedAt),
            or(
              and(
                eq(schema.marketTrends.region, Region.DOMESTIC),
                inArray(schema.marketTrends.year, [
                  ...(param.marketStats?.domesticMarketTrends.map((marketTrend) => marketTrend.year) || []),
                ]),
              ),
              and(
                eq(schema.marketTrends.region, Region.GLOBAL),
                inArray(schema.marketTrends.year, [
                  ...(param.marketStats?.globalMarketTrends.map((marketTrend) => marketTrend.year) || []),
                ]),
              ),
            ),
          ),
        )

      const savedMarketTrends = await trxCtx
        .insert(schema.marketTrends)
        .values([
          ...param.marketStats.domesticMarketTrends.map((marketTrend) => ({
            marketStatsId: savedMarketStats.id,
            region: Region.DOMESTIC,
            ...marketTrend,
          })),
          ...param.marketStats.globalMarketTrends.map((marketTrend) => ({
            marketStatsId: savedMarketStats.id,
            region: Region.GLOBAL,
            ...marketTrend,
          })),
        ])
        .returning()

      // avg revenue
      await trxCtx
        .update(schema.avgRevenues)
        .set({ deletedAt: new Date() })
        .where(and(eq(schema.avgRevenues.marketStatsId, savedMarketStats.id), isNull(schema.avgRevenues.deletedAt)))

      const savedAvgRevenues = await trxCtx
        .insert(schema.avgRevenues)
        .values([
          {
            marketStatsId: savedMarketStats.id,
            region: Region.GLOBAL,
            ...param.marketStats.domesticAvgRevenue,
          },
          {
            marketStatsId: savedMarketStats.id,
            region: Region.GLOBAL,
            ...param.marketStats.globalAvgRevenue,
          },
        ])
        .returning()

      return mapMarketStats(savedMarketStats, savedMarketTrends!, savedAvgRevenues!)
    })
  }
}
