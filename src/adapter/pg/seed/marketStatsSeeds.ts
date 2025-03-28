import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'

export const marketStatsSeeds: InferInsertModel<typeof schema.marketStats>[] = [
  {
    id: 1,
    industryPath: '헬스케어>디지털 헬스>건강관리 서비스>AI 기반 솔루션',
    score: 85,
  },
  {
    id: 2,
    industryPath: '환경>모니터링 시스템>스마트시티>IoT 솔루션',
    score: 78,
  },
]
