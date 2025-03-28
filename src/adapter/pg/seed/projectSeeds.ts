import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'

export const projectSeeds: InferInsertModel<typeof schema.projects>[] = [
  {
    id: 1,
    userId: 3,
    name: 'AI 기반 건강관리 플랫폼',
    industryPath: '헬스케어>디지털 헬스>건강관리 서비스>AI 기반 솔루션',
  },
  {
    id: 2,
    userId: 3,
    name: '스마트 도시 환경 모니터링 시스템',
    industryPath: '환경>모니터링 시스템>스마트시티>IoT 솔루션',
  },
]
