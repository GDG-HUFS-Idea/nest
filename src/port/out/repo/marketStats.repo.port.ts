import { MarketStats } from 'src/domain/marketStats'
import { RdbClient } from 'src/shared/type/rdbClient.type'

export const MARKET_STATS_REPO = Symbol('MARKET_STATS_REPO')

export interface MarketStatsRepoPort {
  findOneByIndustryPath(param: {
    industryPath: string
    duration: number
    ctx?: RdbClient
  }): Promise<MarketStats | null>

  saveOne(param: {
    marketStats: MarketStats
    ctx?: RdbClient
  }): Promise<MarketStats>
}
