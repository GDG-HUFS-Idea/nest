import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'
import { AvgRevenue, MarketStats, MarketTrend } from 'src/domain/marketStats'
import { Currency, Region } from 'src/shared/enum/enum'

export const mapMarketStats = (
  marketStats: InferSelectModel<typeof schema.marketStats>,
  marketTrends: InferSelectModel<typeof schema.marketTrends>[],
  avgRevenues: InferSelectModel<typeof schema.avgRevenues>[],
) => {
  const marketTrendsByRegion: MarketTrend = {
    [Region.DOMESTIC]: [],
    [Region.GLOBAL]: [],
  }

  for (const marketTrend of marketTrends) {
    marketTrendsByRegion[marketTrend.region].push({
      year: marketTrend.year,
      volume: marketTrend.volume,
      currency: marketTrend.currency,
      growthRate: marketTrend.growthRate,
      source: marketTrend.source,
    })
  }

  const avgRevenuesByRegion: AvgRevenue = {
    [Region.DOMESTIC]: [],
    [Region.GLOBAL]: [],
  }

  for (const avgRevenue of avgRevenues) {
    avgRevenuesByRegion[avgRevenue.region].push({
      amount: avgRevenue.amount,
      currency: avgRevenue.currency,
      source: avgRevenue.source,
    })
  }

  return new MarketStats({
    id: marketStats.id,
    industryPath: marketStats.industryPath,
    score: marketStats.score,
    marketTrend: marketTrendsByRegion,
    avgRevenue: avgRevenuesByRegion,
    createdAt: marketStats.createdAt,
    updatedAt: marketStats.updatedAt,
    deletedAt: marketStats.deletedAt || undefined,
  })
}
