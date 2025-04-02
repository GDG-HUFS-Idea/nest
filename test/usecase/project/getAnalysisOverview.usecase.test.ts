import { Test, TestingModule } from '@nestjs/testing'
import { GetAnalysisOverviewUsecase } from 'src/usecase/project/getAnalysisOverview.usecase'
import {
  PROJECT_REPO,
  ProjectRepoPort,
} from 'src/port/out/repo/project.repo.port'
import {
  MARKET_STATS_REPO,
  MarketStatsRepoPort,
} from 'src/port/out/repo/marketStats.repo.port'
import { Project } from 'src/domain/project'
import { MarketStats } from 'src/domain/marketStats'
import { AnalysisOverview } from 'src/domain/analysisOverview'
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { GetAnalysisOverviewUsecaseDto } from 'src/adapter/app/dto/project/getAnalysisOverview.usecase.dto'
import { UserPermission, Currency } from 'src/shared/enum/enum'

describe('GetAnalysisOverviewUsecase', () => {
  let usecase: GetAnalysisOverviewUsecase
  let projectRepo: ProjectRepoPort
  let marketStatsRepo: MarketStatsRepoPort

  // 테스트용 사용자 Mock 객체
  const mockUser: User = {
    id: 1,
    permissions: [UserPermission.GENERAL],
  }

  // 테스트용 분석 개요 Mock 객체
  const mockAnalysisOverview = new AnalysisOverview({
    projectId: 1,
    industryPath: 'tech/software',
    summary: '프로젝트 요약',
    review: '프로젝트 검토',
    similarServicesScore: 85,
    limitationsScore: 70,
    opportunitiesScore: 90,
    similarServices: [
      {
        description: 'Similar service description',
        logoUrl: 'http://example.com/logo.png',
        websiteUrl: 'http://example.com',
        tags: ['tag1', 'tag2'],
        summary: 'Service summary',
      },
    ],
    supportPrograms: [
      {
        name: 'Support Program',
        organizer: 'Organizer',
        url: 'http://example.com',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      },
    ],
    targetMarkets: [
      {
        target: 'Target market',
        iconUrl: 'http://example.com/icon.png',
        order: 1,
        reasons: ['reason1', 'reason2'],
        appeal: ['appeal1', 'appeal2'],
        onlineActivity: ['activity1', 'activity2'],
        onlineChannels: ['channel1', 'channel2'],
        offlineChannels: ['channel1', 'channel2'],
      },
    ],
    marketingStrategies: [
      {
        title: 'Marketing Strategy',
        details: [
          {
            label: 'Strategy Label',
            description: 'Strategy Description',
          },
        ],
      },
    ],
    businessModel: {
      summary: 'Business model summary',
      valueProp: {
        content: 'Value proposition content',
        details: [
          {
            label: 'Value Prop Label',
            description: 'Value Prop Description',
          },
        ],
      },
      revenue: [
        {
          label: 'Revenue Label',
          description: 'Revenue Description',
          details: ['detail1', 'detail2'],
        },
      ],
      investments: [
        {
          order: 1,
          section: 'Investment Section',
          details: [
            {
              label: 'Investment Label',
              description: 'Investment Description',
            },
          ],
        },
      ],
    },
    opportunities: [
      {
        title: 'Opportunity Title',
        description: 'Opportunity Description',
      },
    ],
    limitations: [
      {
        category: 'Limitation Category',
        detail: 'Limitation Detail',
        impact: 'Limitation Impact',
        solution: 'Limitation Solution',
      },
    ],
    teamRequirements: [
      {
        order: 1,
        role: 'Team Role',
        skills: ['skill1', 'skill2'],
        tasks: ['task1', 'task2'],
        salaryMin: 50000,
        salaryMax: 80000,
        currency: Currency.KRW,
      },
    ],
  })

  // 테스트용 프로젝트 Mock 객체
  const mockProject = new Project({
    id: 1,
    userId: mockUser.id,
    name: '테스트 프로젝트',
    industryPath: 'tech/software',
    analysisOverview: mockAnalysisOverview,
  })

  // 테스트용 마켓 통계 Mock 객체
  const mockMarketStats = new MarketStats({
    industryPath: 'tech/software',
    score: 80,
    domesticMarketTrends: Array(5)
      .fill(0)
      .map((_, i) => ({
        year: 2020 + i,
        volume: 1000000000,
        currency: Currency.KRW,
        growthRate: 5.5,
        source: 'http://example.com',
      })),
    globalMarketTrends: Array(5)
      .fill(0)
      .map((_, i) => ({
        year: 2020 + i,
        volume: 10000000,
        currency: Currency.USD,
        growthRate: 7.2,
        source: 'http://example.com',
      })),
    domesticAvgRevenue: {
      amount: 1000000,
      currency: Currency.KRW,
      source: 'http://example.com',
    },
    globalAvgRevenue: {
      amount: 10000,
      currency: Currency.USD,
      source: 'http://example.com',
    },
  })

  beforeEach(async () => {
    // Mock 객체 생성
    const mockProjectRepo: ProjectRepoPort = {
      findOneById: jest.fn(),
      findManyByUserId: jest.fn(),
      findOneByIdJoinAnalysisOverview: jest.fn(),
      saveOne: jest.fn(),
    }

    const mockMarketStatsRepo: MarketStatsRepoPort = {
      findOneByIndustryPath: jest.fn(),
      saveOne: jest.fn(),
    }

    // 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAnalysisOverviewUsecase,
        {
          provide: PROJECT_REPO,
          useValue: mockProjectRepo,
        },
        {
          provide: MARKET_STATS_REPO,
          useValue: mockMarketStatsRepo,
        },
      ],
    }).compile()

    // 의존성 주입
    usecase = module.get<GetAnalysisOverviewUsecase>(GetAnalysisOverviewUsecase)
    projectRepo = module.get<ProjectRepoPort>(PROJECT_REPO)
    marketStatsRepo = module.get<MarketStatsRepoPort>(MARKET_STATS_REPO)
  })

  it('프로젝트와 시장 통계를 성공적으로 조회하여 분석 개요 반환', async () => {
    // 준비
    const projectId = 1
    const dto: GetAnalysisOverviewUsecaseDto = { id: projectId }
    const currentYear = new Date().getFullYear()
    const fromYear = currentYear - 5 + 1 // 예: 2021
    const toYear = currentYear // 예: 2025

    // Mock 동작 설정
    jest
      .spyOn(projectRepo, 'findOneByIdJoinAnalysisOverview')
      .mockResolvedValue(mockProject)
    jest
      .spyOn(marketStatsRepo, 'findOneByIndustryPath')
      .mockResolvedValue(mockMarketStats)

    // 실행
    const result = await usecase.exec(dto, mockUser)

    // 검증
    expect(projectRepo.findOneByIdJoinAnalysisOverview).toHaveBeenCalledWith({
      id: projectId,
    })
    expect(marketStatsRepo.findOneByIndustryPath).toHaveBeenCalledWith({
      industryPath: mockProject.analysisOverview!.industryPath,
      fromYear,
      toYear,
    })

    // 응답 확인
    expect(result).toHaveProperty(
      'summary',
      mockProject.analysisOverview!.summary,
    )
    expect(result).toHaveProperty(
      'review',
      mockProject.analysisOverview!.review,
    )
    expect(result.project.id).toBe(mockProject.id)
    expect(result.project.name).toBe(mockProject.name)
    expect(result.market_stats.score).toBe(mockMarketStats.score)
    expect(result.similar_service.score).toBe(
      mockProject.analysisOverview!.similarServicesScore,
    )
  })

  it('프로젝트가 존재하지 않을 때 NotFoundException 발생', async () => {
    // 준비
    const projectId = 999
    const dto: GetAnalysisOverviewUsecaseDto = { id: projectId }

    // Mock 동작 설정
    jest
      .spyOn(projectRepo, 'findOneByIdJoinAnalysisOverview')
      .mockResolvedValue(null)

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(NotFoundException)
    expect(projectRepo.findOneByIdJoinAnalysisOverview).toHaveBeenCalledWith({
      id: projectId,
    })
  })

  it('사용자가 프로젝트 소유자가 아닐 때 ForbiddenException 발생', async () => {
    // 준비
    const projectId = 1
    const dto: GetAnalysisOverviewUsecaseDto = { id: projectId }

    const projectWithDifferentOwner = new Project({
      ...mockProject,
      userId: 2, // 다른 사용자 ID로 설정
    })

    // Mock 동작 설정
    jest
      .spyOn(projectRepo, 'findOneByIdJoinAnalysisOverview')
      .mockResolvedValue(projectWithDifferentOwner)

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(
      ForbiddenException,
    )
    expect(projectRepo.findOneByIdJoinAnalysisOverview).toHaveBeenCalledWith({
      id: projectId,
    })
  })

  it('시장 통계 데이터 조회 중 오류 발생 시 BadGatewayException 발생', async () => {
    // 준비
    const projectId = 1
    const dto: GetAnalysisOverviewUsecaseDto = { id: projectId }
    const currentYear = new Date().getFullYear()
    const fromYear = currentYear - 5 + 1
    const toYear = currentYear

    // Mock 동작 설정
    jest
      .spyOn(projectRepo, 'findOneByIdJoinAnalysisOverview')
      .mockResolvedValue(mockProject)
    jest
      .spyOn(marketStatsRepo, 'findOneByIndustryPath')
      .mockRejectedValue(new Error('Database error'))

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow('Bad Gateway')
    expect(projectRepo.findOneByIdJoinAnalysisOverview).toHaveBeenCalledWith({
      id: projectId,
    })
    expect(marketStatsRepo.findOneByIndustryPath).toHaveBeenCalledWith({
      industryPath: mockProject.analysisOverview!.industryPath,
      fromYear,
      toYear,
    })
  })

  it('시장 트렌드 길이가 올바르지 않을 때 InternalServerErrorException 발생', async () => {
    // 준비
    const projectId = 1
    const dto: GetAnalysisOverviewUsecaseDto = { id: projectId }
    const currentYear = new Date().getFullYear()
    const fromYear = currentYear - 5 + 1
    const toYear = currentYear

    // 잘못된 길이의 시장 트렌드를 가진 MarketStats
    const invalidMarketStats = new MarketStats({
      ...mockMarketStats,
      domesticMarketTrends: Array(3)
        .fill(0)
        .map((_, i) => ({
          year: 2020 + i,
          volume: 1000000000,
          currency: Currency.KRW,
          growthRate: 5.5,
          source: 'http://example.com',
        })), // 요구되는 5개 대신 3개만 존재
    })

    // Mock 동작 설정
    jest
      .spyOn(projectRepo, 'findOneByIdJoinAnalysisOverview')
      .mockResolvedValue(mockProject)
    jest
      .spyOn(marketStatsRepo, 'findOneByIndustryPath')
      .mockResolvedValue(invalidMarketStats)

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(
      InternalServerErrorException,
    )
    expect(projectRepo.findOneByIdJoinAnalysisOverview).toHaveBeenCalledWith({
      id: projectId,
    })
    expect(marketStatsRepo.findOneByIndustryPath).toHaveBeenCalledWith({
      industryPath: mockProject.analysisOverview!.industryPath,
      fromYear,
      toYear,
    })
  })

  it('시장 통계가 존재하지 않을 때 NotFoundException 발생', async () => {
    // 준비
    const projectId = 1
    const dto: GetAnalysisOverviewUsecaseDto = { id: projectId }
    const currentYear = new Date().getFullYear()
    const fromYear = currentYear - 5 + 1
    const toYear = currentYear

    // Mock 동작 설정
    jest
      .spyOn(projectRepo, 'findOneByIdJoinAnalysisOverview')
      .mockResolvedValue(mockProject)
    jest.spyOn(marketStatsRepo, 'findOneByIndustryPath').mockResolvedValue(null)

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(NotFoundException)
    expect(projectRepo.findOneByIdJoinAnalysisOverview).toHaveBeenCalledWith({
      id: projectId,
    })
    expect(marketStatsRepo.findOneByIndustryPath).toHaveBeenCalledWith({
      industryPath: mockProject.analysisOverview!.industryPath,
      fromYear,
      toYear,
    })
  })
})
