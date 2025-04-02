import { Injectable } from '@nestjs/common'
import { MarketStatsRepoPort } from 'src/port/out/repo/marketStats.repo.port'
import { PgService } from '../pg.service'
import * as schema from '../drizzle/schema'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { and, eq, isNull, gt } from 'drizzle-orm'
import { MarketStats } from 'src/domain/marketStats'
import { mapMarketStats } from '../mapper/mapMarketStats'
import { Region } from 'src/shared/enum/enum'

@Injectable()
export class MarketStatsRepo implements MarketStatsRepoPort {
  constructor(private readonly pgService: PgService) {}

  async findOneByIndustryPath(param: {
    industryPath: string
    duration: number
    ctx?: RdbClient
  }): Promise<MarketStats | null> {
    const ctx = param.ctx ?? this.pgService.getClient()
    const date = new Date()
    date.setDate(date.getDate() - param.duration)

    const marketStats = await ctx.query.marketStats.findFirst({
      where: and(
        eq(schema.marketStats.industryPath, param.industryPath),
        isNull(schema.marketStats.deletedAt),
        gt(schema.marketStats.createdAt, date),
      ),
    })

    if (!marketStats) return null

    const marketTrends = await ctx.query.marketTrends.findMany({
      where: and(
        eq(schema.marketTrends.marketStatsId, marketStats.id),
        isNull(schema.marketTrends.deletedAt),
      ),
    })

    const avgRevenues = await ctx.query.avgRevenues.findMany({
      where: and(
        eq(schema.avgRevenues.marketStatsId, marketStats.id),
        isNull(schema.avgRevenues.deletedAt),
      ),
    })

    return mapMarketStats(marketStats, marketTrends, avgRevenues)
  }

  async saveOne(param: {
    marketStats: MarketStats
    ctx?: RdbClient
  }): Promise<MarketStats> {
    const ctx = param.ctx ?? this.pgService.getClient()
    const marketStats = param.marketStats
    let savedMarketStats

    try {
      if (marketStats.id) {
        const [updatedStats] = await ctx
          .update(schema.marketStats)
          .set({
            score: marketStats.score,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(schema.marketStats.id, marketStats.id),
              isNull(schema.marketStats.deletedAt),
            ),
          )
          .returning()

        if (!updatedStats) {
          throw new Error('Market stats update failed')
        }

        savedMarketStats = updatedStats

        await ctx
          .update(schema.marketTrends)
          .set({ deletedAt: new Date() })
          .where(eq(schema.marketTrends.marketStatsId, savedMarketStats.id))
          .execute()

        await ctx
          .update(schema.avgRevenues)
          .set({ deletedAt: new Date() })
          .where(eq(schema.avgRevenues.marketStatsId, savedMarketStats.id))
          .execute()
      } else {
        const [newStats] = await ctx
          .insert(schema.marketStats)
          .values({
            industryPath: marketStats.industryPath,
            score: marketStats.score,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()

        if (!newStats) {
          throw new Error('Market stats insertion failed')
        }

        savedMarketStats = newStats
      }

      const domesticMarketTrends = await Promise.all(
        marketStats.domesticMarketTrends.map(async (trend) => {
          const [savedTrend] = await ctx
            .insert(schema.marketTrends)
            .values({
              marketStatsId: savedMarketStats.id,
              region: Region.DOMESTIC,
              year: trend.year,
              volume: trend.volume,
              currency: trend.currency,
              growthRate: trend.growthRate,
              source: trend.source,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()
          return savedTrend
        }),
      )

      const globalMarketTrends = await Promise.all(
        marketStats.globalMarketTrends.map(async (trend) => {
          const [savedTrend] = await ctx
            .insert(schema.marketTrends)
            .values({
              marketStatsId: savedMarketStats.id,
              region: Region.GLOBAL,
              year: trend.year,
              volume: trend.volume,
              currency: trend.currency,
              growthRate: trend.growthRate,
              source: trend.source,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()
          return savedTrend
        }),
      )

      const [domesticAvgRevenue] = await ctx
        .insert(schema.avgRevenues)
        .values({
          marketStatsId: savedMarketStats.id,
          region: Region.DOMESTIC,
          amount: marketStats.domesticAvgRevenue.amount,
          currency: marketStats.domesticAvgRevenue.currency,
          source: marketStats.domesticAvgRevenue.source,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      const [globalAvgRevenue] = await ctx
        .insert(schema.avgRevenues)
        .values({
          marketStatsId: savedMarketStats.id,
          region: Region.GLOBAL,
          amount: marketStats.globalAvgRevenue.amount,
          currency: marketStats.globalAvgRevenue.currency,
          source: marketStats.globalAvgRevenue.source,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      return mapMarketStats(
        savedMarketStats,
        [...domesticMarketTrends, ...globalMarketTrends],
        [domesticAvgRevenue, globalAvgRevenue],
      )
    } catch (error) {
      throw error
    }
  }
}
