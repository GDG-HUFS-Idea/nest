import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'

export const ideaSeeds: InferInsertModel<typeof schema.ideas>[] = [
  {
    id: 1,
    projectId: 1,
    problem:
      '현대인들은 건강관리의 중요성을 알면서도 전문적인 지식 부재와 시간 부족으로 효과적인 건강관리에 어려움을 겪고 있습니다.',
    solution:
      '사용자의 건강 데이터(식습관, 운동량, 수면 패턴 등)를 수집하여 AI 알고리즘으로 분석한 후, 개인화된 건강관리 가이드를 제공합니다.',
  },
  {
    id: 2,
    projectId: 2,
    problem: '도시 환경 오염에 대한 실시간 모니터링 부재로 대응책 마련이 어렵습니다.',
    solution:
      '저비용 IoT 센서를 도시 곳곳에 설치하고, 클라우드 기반 데이터 분석 플랫폼을 구축하여 실시간 환경 정보를 제공합니다.',
  },
]
