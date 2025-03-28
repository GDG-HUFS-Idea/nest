import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'
import { Currency, Region } from 'src/shared/enum/enum'

export const avgRevenueSeeds: InferInsertModel<typeof schema.avgRevenues>[] = [
  // 헬스케어 - 국내 평균 매출
  {
    id: 1,
    marketStatsId: 1,
    region: Region.DOMESTIC,
    amount: 3500000000,
    currency: Currency.KRW,
    source: 'https://example.com/korean-health-tech-revenue-2021',
  },
  // 헬스케어 - 글로벌 평균 매출
  {
    id: 2,
    marketStatsId: 1,
    region: Region.GLOBAL,
    amount: 28000000000,
    currency: Currency.USD,
    source: 'https://example.com/global-health-tech-revenue-2021',
  },
  // 환경 모니터링 - 국내 평균 매출
  {
    id: 3,
    marketStatsId: 2,
    region: Region.DOMESTIC,
    amount: 2800000000,
    currency: Currency.KRW,
    source: 'https://example.com/korean-env-monitoring-revenue-2021',
  },
  // 환경 모니터링 - 글로벌 평균 매출
  {
    id: 4,
    marketStatsId: 2,
    region: Region.GLOBAL,
    amount: 20000000000,
    currency: Currency.USD,
    source: 'https://example.com/global-env-monitoring-revenue-2021',
  },
]
