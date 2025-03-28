import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'

export const ideaSeeds: InferInsertModel<typeof schema.ideas>[] = [
  {
    id: 1,
    projectId: 1,
    problem:
      '현대인들은 건강관리의 중요성을 알면서도 전문적인 지식 부재와 시간 부족으로 효과적인 건강관리에 어려움을 겪고 있습니다.',
    motivation:
      '인공지능 기술을 활용해 사용자별 맞춤형 건강관리 솔루션을 제공하여 바쁜 현대인들도 쉽게 건강을 관리할 수 있게 하고자 합니다.',
    features:
      '1. 개인별 건강 데이터 분석\n2. AI 기반 맞춤형 건강 조언\n3. 실시간 건강 모니터링\n4. 식단 및 운동 추천',
    method:
      '사용자의 건강 데이터(식습관, 운동량, 수면 패턴 등)를 수집하여 AI 알고리즘으로 분석한 후, 개인화된 건강관리 가이드를 제공합니다.',
    deliverable: '모바일 앱(iOS, Android) 및 웹 서비스',
  },
  {
    id: 2,
    projectId: 2,
    problem:
      '도시 환경 오염에 대한 실시간 모니터링 부재로 대응책 마련이 어렵습니다.',
    motivation:
      'IoT 기술을 활용해 도시 곳곳의 환경 데이터를 실시간으로 수집하고 분석하여 더 나은 생활환경을 조성하고자 합니다.',
    features:
      '1. 실시간 대기질 모니터링\n2. 소음 수준 측정\n3. 데이터 시각화 대시보드\n4. 오염 알림 서비스',
    method:
      '저비용 IoT 센서를 도시 곳곳에 설치하고, 클라우드 기반 데이터 분석 플랫폼을 구축하여 실시간 환경 정보를 제공합니다.',
    deliverable: 'IoT 센서 네트워크, 모바일 앱, 웹 대시보드',
  },
]
