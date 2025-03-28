import { Currency } from 'src/shared/enum/enum'

export type MarketTrend = {
  year: number
  volume: number
  currency: Currency
  growthRate: number
  source: string
}

export type AvgRevenue = {
  amount: number
  currency: Currency
  source: string
}

export class MarketStats {
  id?: number
  industryPath!: string
  score!: number
  domesticMarketTrends!: MarketTrend[]
  globalMarketTrends!: MarketTrend[]
  domesticAvgRevenue!: AvgRevenue
  globalAvgRevenue!: AvgRevenue
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  constructor(param: {
    id?: number
    industryPath: string
    score: number
    domesticMarketTrends: MarketTrend[]
    globalMarketTrends: MarketTrend[]
    domesticAvgRevenue: AvgRevenue
    globalAvgRevenue: AvgRevenue
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
  }) {
    this.id = param.id
    this.industryPath = param.industryPath
    this.score = param.score
    this.domesticMarketTrends = param.domesticMarketTrends
    this.globalMarketTrends = param.globalMarketTrends
    this.domesticAvgRevenue = param.domesticAvgRevenue
    this.globalAvgRevenue = param.globalAvgRevenue
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
  }
}
