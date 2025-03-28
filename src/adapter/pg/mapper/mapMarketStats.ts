import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'
import { AvgRevenue, MarketStats, MarketTrend } from 'src/domain/marketStats'
import { Currency, Region } from 'src/shared/enum/enum'

export const mapMarketStats = (
  marketStats: InferSelectModel<typeof schema.marketStats>,
  marketTrends: InferSelectModel<typeof schema.marketTrends>[],
  avgRevenues: InferSelectModel<typeof schema.avgRevenues>[],
) => {
  const domesticMarketTrends: MarketTrend[] = []
  const globalMarketTrends: MarketTrend[] = []

  for (const marketTrend of marketTrends) {
    const trendData: MarketTrend = {
      year: marketTrend.year,
      volume: marketTrend.volume,
      currency: marketTrend.currency as Currency,
      growthRate: marketTrend.growthRate,
      source: marketTrend.source,
    }

    if (marketTrend.region === Region.DOMESTIC) {
      domesticMarketTrends.push(trendData)
    } else if (marketTrend.region === Region.GLOBAL) {
      globalMarketTrends.push(trendData)
    }
  }

  domesticMarketTrends.sort((a, b) => a.year - b.year)
  globalMarketTrends.sort((a, b) => a.year - b.year)

  let domesticAvgRevenue: AvgRevenue = {
    amount: 0,
    currency: Currency.KRW,
    source: '',
  }

  let globalAvgRevenue: AvgRevenue = {
    amount: 0,
    currency: Currency.USD,
    source: '',
  }

  for (const avgRevenue of avgRevenues) {
    const revenueData: AvgRevenue = {
      amount: avgRevenue.amount,
      currency: avgRevenue.currency as Currency,
      source: avgRevenue.source,
    }

    if (avgRevenue.region === Region.DOMESTIC) {
      domesticAvgRevenue = revenueData
    } else if (avgRevenue.region === Region.GLOBAL) {
      globalAvgRevenue = revenueData
    }
  }

  return new MarketStats({
    id: marketStats.id,
    industryPath: marketStats.industryPath,
    score: marketStats.score,
    domesticMarketTrends: domesticMarketTrends,
    globalMarketTrends: globalMarketTrends,
    domesticAvgRevenue: domesticAvgRevenue,
    globalAvgRevenue: globalAvgRevenue,
    createdAt: marketStats.createdAt,
    updatedAt: marketStats.updatedAt,
    deletedAt: marketStats.deletedAt || undefined,
  })
}
