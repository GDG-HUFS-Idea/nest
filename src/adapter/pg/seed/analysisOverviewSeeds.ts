import * as schema from '../drizzle/schema'
import { InferInsertModel } from 'drizzle-orm'

export const analysisOverviewSeeds: InferInsertModel<typeof schema.analysisOverview>[] = [
  {
    id: 1,
    projectId: 1,
    summary: '사용자 맞춤형 AI 기반 건강관리 플랫폼',
    industryPath: '헬스케어>디지털 헬스>건강관리 서비스>AI 기반 솔루션',
    review:
      '개인화된 건강 데이터 분석과 코칭을 제공하고 있어 성장 가능성이 높은 아이템입니다. 최근 건강에 대한 관심 증가와 기술 발전으로 시장성이 높습니다.',
    similarServicesScore: 78,
    limitationsScore: 65,
    opportunitiesScore: 90,
    similarServices: [
      {
        description: 'AI 기반 개인 맞춤형 다이어트 및 건강관리 플랫폼',
        logoUrl: 'https://example.com/noom-logo.png',
        websiteUrl: 'https://www.noom.com',
        tags: ['건강관리', '다이어트', 'AI 코칭', '습관 형성'],
        summary:
          'Noom은 심리학과 AI를 결합한 건강관리 앱으로, 사용자의 식습관과 운동 패턴을 분석하여 맞춤형 코칭을 제공합니다.',
      },
      {
        description: '개인화된 식단 추천과 영양 분석을 제공하는 건강관리 앱',
        logoUrl: 'https://example.com/lifesum-logo.png',
        websiteUrl: 'https://www.lifesum.com',
        tags: ['영양관리', '식단 추천', '건강 트래킹', '라이프스타일'],
        summary: 'Lifesum은 사용자의 건강 목표와 선호도에 맞는 맞춤형 식단과 영양 조언을 제공하는 앱입니다.',
      },
    ],
    supportPrograms: [
      {
        name: '디지털 헬스케어 스타트업 육성 프로그램',
        organizer: '한국보건산업진흥원',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-30'),
      },
      {
        name: '2025 혁신의료기기 실증지원사업',
        organizer: '식품의약품안전처',
        startDate: new Date('2025-05-15'),
        endDate: new Date('2025-06-15'),
      },
    ],
    targetMarkets: [
      {
        target: '30-40대 건강관리에 관심 있는 직장인',
        order: 1,
        reason: '건강관리 필요성은 인식하지만 시간적 여유가 부족한 집단, 디지털 기기 활용도가 높고 구매력이 있음',
        appeal: '바쁜 일상 속에서도 손쉽게 관리할 수 있는 맞춤형 건강 솔루션',
        onlineActivity: '유튜브에서 건강 콘텐츠 시청, 인스타그램에서 건강식품/운동 관련 계정 팔로우',
        onlineChannels: '인스타그램, 유튜브, 네이버/구글 검색',
        offlineChannels: '헬스장/피트니스 센터, 건강검진센터',
      },
    ],
    businessModel: {
      summary: '구독 기반 헬스케어 플랫폼',
      valueProp: '사용자의 건강 데이터를 AI로 분석하여 개인화된 건강관리 솔루션을 제공하는 플랫폼',
      revenue: '월 9,900원의 기본 구독료, 기본적인 건강 데이터 분석 및 리포트, 일일 건강 목표 설정 및 관리',
      investments: [
        {
          order: 1,
          section: '기술 개발',
          description: '개인화된 건강 분석 및 추천 엔진 개발',
        },
      ],
    },
    opportunities: [
      '글로벌 디지털 헬스케어 시장은 연평균 20% 이상의 성장률을 보이고 있으며, 코로나19 이후 원격 의료 및 건강관리에 대한 수요가 급증하고 있습니다.',
      '인공지능 기술의 발전으로 개인 건강 데이터 분석의 정확도가 높아지고, 맞춤형 건강 관리 솔루션 제공이 가능해졌습니다.',
    ],
    limitations: [
      {
        category: '법률적 리스크',
        detail: '개인 건강 정보는 민감한 개인정보로 분류되어 엄격한 규제를 받음',
        impact: '각 국가별 의료 데이터 관련 법규를 위반할 경우 벌금 및 서비스 중단 위험 존재',
        solution: '개인정보 보호법 및 의료법 전문가 자문을 통한 법적 요건 충족',
      },
      {
        category: '지적재산권 리스크',
        detail: '건강 데이터 분석 알고리즘 관련 특허가 이미 존재할 가능성',
        impact: '특허 침해로 인한 법적 분쟁 및 개발 방향 수정 필요성 발생',
        solution: '사전 특허 조사와 회피 설계 진행',
      },
    ],
    teamRequirements: [
      {
        order: 1,
        title: 'AI 전문가',
        skill: '머신러닝, 데이터 분석, Python, TensorFlow/PyTorch',
        responsibility: '건강 데이터 분석 알고리즘 개발, 추천 시스템 구축, 데이터 파이프라인 설계',
      },
      {
        order: 2,
        title: '의학 전문가',
        skill: '내과학, 영양학, 예방의학, 건강관리',
        responsibility: '의학적 가이드라인 수립, 건강 콘텐츠 검증, 임상적 유효성 평가',
      },
    ],
  },
  {
    id: 2,
    projectId: 2,
    summary: '실시간 도시 환경 모니터링 플랫폼',
    industryPath: '환경>모니터링 시스템>스마트시티>IoT 솔루션',
    review:
      '지속적인 환경 문제 관심 증가로 시장 성장 가능성이 높고, IoT 기술 발전으로 구현 가능성도 높습니다. 공공-민간 협력을 통한 확장성이 좋은 아이템입니다.',
    similarServicesScore: 72,
    limitationsScore: 60,
    opportunitiesScore: 85,
    similarServices: [
      {
        description: '실시간 공기질 모니터링 및 분석 플랫폼',
        logoUrl: 'https://example.com/airvisual-logo.png',
        websiteUrl: 'https://www.iqair.com',
        tags: ['대기질', '모니터링', '데이터 분석', '환경'],
        summary:
          'IQAir의 AirVisual은 전 세계 공기질 데이터를 수집하여 실시간 분석 및 예측 정보를 제공하는 플랫폼입니다.',
      },
      {
        description: '도시 소음 매핑 및 모니터링 시스템',
        logoUrl: 'https://example.com/soundscape-logo.png',
        websiteUrl: 'https://www.soundscape-platform.org',
        tags: ['소음 측정', '도시 환경', '스마트시티', '매핑'],
        summary: 'Soundscape는 도시 내 소음 수준을 측정하고 매핑하여 소음 오염을 관리하는 데 도움을 주는 플랫폼입니다.',
      },
    ],
    supportPrograms: [
      {
        name: '2025 스마트시티 챌린지',
        organizer: '국토교통부',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-09-30'),
      },
      {
        name: '환경기술개발사업',
        organizer: '환경부',
        startDate: new Date('2025-04-15'),
        endDate: new Date('2025-10-15'),
      },
    ],
    targetMarkets: [
      {
        target: '지방자치단체',
        order: 1,
        reason: '환경 모니터링 의무화, 스마트시티 프로젝트 증가',
        appeal: '비용 효율적인 환경 모니터링 솔루션, 시민 참여형 데이터 수집 플랫폼',
        onlineActivity: '정부 환경 정책 검색, 환경 관련 뉴스 및 보고서 확인',
        onlineChannels: '정부 포털, 환경 정책 뉴스레터',
        offlineChannels: '환경 정책 포럼, 스마트시티 컨퍼런스',
      },
      {
        target: '환경에 관심있는 일반 시민',
        order: 2,
        reason: '환경 건강에 대한 관심 증가, 참여형 시민과학 트렌드',
        appeal: '개인 주변 환경 데이터 실시간 확인, 커뮤니티 기반 환경 개선 참여',
        onlineActivity: '환경 관련 SNS 활동, 환경 앱 사용',
        onlineChannels: 'SNS, 환경 커뮤니티 앱',
        offlineChannels: '시민단체 활동, 환경 캠페인',
      },
    ],
    businessModel: {
      summary: 'SaaS 기반 환경 모니터링 플랫폼',
      valueProp: 'IoT 센서 네트워크를 통해 수집된 환경 데이터를 실시간으로 분석하고 시각화하는 플랫폼',
      revenue:
        '지방자치단체 대상 연간 구독 서비스, 월 500만원부터 시작하는 기본 구독료, 설치 센서 수에 따른 가격 책정, 수집된 환경 데이터 API 제공',
      investments: [
        {
          order: 1,
          section: '하드웨어 개발',
          description: '저전력, 고정밀 IoT 센서 개발 및 설치, LoRa/5G 기반 무선 데이터 전송 시스템 구축',
        },
        {
          order: 2,
          section: '소프트웨어 개발',
          description: '실시간 데이터 처리 및 AI 기반 분석 시스템, 사용자 친화적인 데이터 시각화 대시보드',
        },
      ],
    },
    opportunities: [
      '전 세계적으로 스마트시티 프로젝트에 대한 정부 투자가 증가하고 있으며, 환경 모니터링은 핵심 구성요소 중 하나입니다.',
      '많은 국가에서 대기질, 소음 등 환경 오염에 대한 규제가 강화되고 있어, 정확한 환경 데이터에 대한 수요가 증가하고 있습니다.',
      '저전력, 고성능 센서와 무선 통신 기술의 발전으로 대규모 환경 센서 네트워크 구축 비용이 감소하고 있습니다.',
    ],
    limitations: [
      {
        category: '기술적 제약',
        detail: '넓은 지역에 센서를 설치하고 유지관리하는 데 드는 비용과 어려움',
        impact: '초기 설치 비용이 높고, 센서 오작동이나 파손 시 유지보수 비용 발생',
        solution: '저전력, 내구성 높은 센서 개발 및 시민 참여형 센서 네트워크 구축',
      },
      {
        category: '데이터 신뢰성',
        detail: '다양한 환경에서 수집된 데이터의 정확성과 일관성 확보 문제',
        impact: '신뢰할 수 없는 데이터는 정책 결정이나 서비스 품질에 부정적 영향',
        solution: 'AI 기반 데이터 검증 알고리즘 개발 및 정기적인 센서 교정',
      },
      {
        category: '수익 모델',
        detail: '공공재적 성격의 서비스로 지속 가능한 수익 모델 구축 어려움',
        impact: '초기 투자 회수와 장기적 수익성 확보에 시간 소요',
        solution: '지자체 구독 모델과 데이터 API 서비스 등 다양한 수익원 개발',
      },
    ],
    teamRequirements: [
      {
        order: 1,
        title: 'IoT 하드웨어 엔지니어',
        skill: '센서 설계, 임베디드 시스템, PCB 설계, 저전력 최적화',
        responsibility: '환경 센서 모듈 설계, 데이터 전송 시스템 개발, 배터리 최적화',
      },
      {
        order: 2,
        title: '데이터 사이언티스트',
        skill: '머신러닝, 시계열 분석, Python, R',
        responsibility: '환경 데이터 분석 알고리즘 개발, 예측 모델 구축, 데이터 검증 시스템 개발',
      },
      {
        order: 3,
        title: '풀스택 개발자',
        skill: 'React, Node.js, AWS, 데이터 시각화',
        responsibility: '대시보드 개발, API 서비스 구축, 데이터베이스 설계',
      },
    ],
  },
]
