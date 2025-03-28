import { Currency, Region } from 'src/shared/enum/enum'

export type MarketTrend = {
  [key in Region]: {
    year: number
    volume: number
    currency: Currency
    growthRate: number
    source: string
  }[]
}

export type AvgRevenue = {
  [key in Region]: {
    amount: number
    currency: Currency
    source: string
  }[]
}

export class MarketStats {
  id?: number
  industryPath!: string
  score!: number
  marketTrend!: MarketTrend
  avgRevenue!: AvgRevenue
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  constructor(param: {
    id?: number
    industryPath: string
    score: number
    marketTrend: MarketTrend
    avgRevenue: AvgRevenue
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
  }) {
    this.id = param.id
    this.industryPath = param.industryPath
    this.score = param.score
    this.marketTrend = param.marketTrend
    this.avgRevenue = param.avgRevenue
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
  }
}
