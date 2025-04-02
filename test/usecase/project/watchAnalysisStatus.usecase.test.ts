import { Test, TestingModule } from '@nestjs/testing'
import { WatchAnalysisStatusUsecase } from 'src/usecase/project/watchAnalysisStatus.usecase'
import { AI_SERVICE, AiServicePort } from 'src/port/out/service/ai.service.port'
import {
  PROJECT_REPO,
  ProjectRepoPort,
} from 'src/port/out/repo/project.repo.port'
import {
  ANALYSIS_OVERVIEW_REPO,
  AnalysisOverviewRepoPort,
} from 'src/port/out/repo/analysisOverview.repo.port'
import {
  MARKET_STATS_REPO,
  MarketStatsRepoPort,
} from 'src/port/out/repo/marketStats.repo.port'
import {
  TRX_SERVICE,
  TrxServicePort,
} from 'src/port/out/service/trx.service.port'
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { WatchAnalysisStatusUsecaseDto } from 'src/adapter/app/dto/project/watchAnalysisStatus.usecase.dto'
import { Observable, of, throwError } from 'rxjs'
import { Project } from 'src/domain/project'
import { AnalysisOverview } from 'src/domain/analysisOverview'
import { MarketStats } from 'src/domain/marketStats'
import { Currency, UserPermission, UserPlan } from 'src/shared/enum/enum'

describe('WatchAnalysisStatusUsecase', () => {
  let usecase: WatchAnalysisStatusUsecase
  let aiService: AiServicePort
  let projectRepo: ProjectRepoPort
  let analysisOverviewRepo: AnalysisOverviewRepoPort
  let marketStatsRepo: MarketStatsRepoPort
  let trxService: TrxServicePort

  // 테스트용 사용자 Mock 객체
  const mockUser: User = {
    id: 1,
    permissions: [UserPermission.GENERAL],
  }

  beforeEach(async () => {
    // Mock 객체 생성
    const mockAiService: AiServicePort = {
      analyzeIdea: jest.fn(),
      watchAnalysisStatus: jest.fn(),
    }

    const mockProjectRepo: ProjectRepoPort = {
      findOneById: jest.fn(),
      findManyByUserId: jest.fn(),
      findOneByIdJoinAnalysisOverview: jest.fn(),
      saveOne: jest.fn(),
    }

    const mockAnalysisOverviewRepo: AnalysisOverviewRepoPort = {
      findOneByIdJoinProject: jest.fn(),
      saveOne: jest.fn(),
    }

    const mockMarketStatsRepo: MarketStatsRepoPort = {
      findOneByIndustryPath: jest.fn(),
      saveOne: jest.fn(),
    }

    const mockTrxService: TrxServicePort = {
      startTrx: jest.fn(),
    }

    // 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchAnalysisStatusUsecase,
        {
          provide: AI_SERVICE,
          useValue: mockAiService,
        },
        {
          provide: PROJECT_REPO,
          useValue: mockProjectRepo,
        },
        {
          provide: ANALYSIS_OVERVIEW_REPO,
          useValue: mockAnalysisOverviewRepo,
        },
        {
          provide: MARKET_STATS_REPO,
          useValue: mockMarketStatsRepo,
        },
        {
          provide: TRX_SERVICE,
          useValue: mockTrxService,
        },
      ],
    }).compile()

    // 의존성 주입
    usecase = module.get<WatchAnalysisStatusUsecase>(WatchAnalysisStatusUsecase)
    aiService = module.get<AiServicePort>(AI_SERVICE)
    projectRepo = module.get<ProjectRepoPort>(PROJECT_REPO)
    analysisOverviewRepo = module.get<AnalysisOverviewRepoPort>(
      ANALYSIS_OVERVIEW_REPO,
    )
    marketStatsRepo = module.get<MarketStatsRepoPort>(MARKET_STATS_REPO)
    trxService = module.get<TrxServicePort>(TRX_SERVICE)
  })

  it('진행 중인 분석 상태를 올바르게 처리하여 진행 정보 반환', (done) => {
    // 준비
    const taskId = 'task-123'
    const mockProgressEvent = {
      is_success: true,
      data: {
        is_complete: false,
        status: 'in_progress',
        progress: 0.5,
        message: '분석 중입니다...',
      },
    }

    jest
      .spyOn(aiService, 'watchAnalysisStatus')
      .mockReturnValue(of(mockProgressEvent as any))

    const dto: WatchAnalysisStatusUsecaseDto = { task_id: taskId }

    // 실행 및 검증
    usecase.exec(dto, mockUser).subscribe({
      next: (result) => {
        expect(result).toEqual({
          is_complete: false,
          progress: 0.5,
          message: '분석 중입니다...',
        })
        expect(aiService.watchAnalysisStatus).toHaveBeenCalledWith({
          task_id: taskId,
        })
        done()
      },
      error: (error) => done(error),
    })
  })

  it('분석 완료 시 데이터 저장 및 완료 응답 반환', (done) => {
    // 준비
    const taskId = 'task-123'
    const projectId = 123
    const projectName = 'Test Project'

    // 완료된 분석 이벤트 Mock
    const mockCompletedEvent = {
      is_success: true,
      data: {
        is_complete: true,
        status: 'completed',
        result: {
          project: {
            id: projectId,
            name: projectName,
          },
          industryPath: 'tech>software>something',
          summary: 'Project summary',
          review: 'Project review',
          similarServicesScore: 85,
          limitationsScore: 70,
          opportunitiesScore: 90,
          similarServices: [],
          supportPrograms: [],
          targetMarkets: [],
          marketingStrategies: [],
          businessModel: {},
          opportunities: [],
          limitations: [],
          teamRequirements: [],
          marketStats: {
            score: 80,
            domesticMarketTrends: [],
            globalMarketTrends: [],
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
          },
        },
      },
    }

    // 저장될 프로젝트 Mock
    const savedProject = new Project({
      id: projectId,
      userId: mockUser.id,
      name: projectName,
      industryPath: 'tech>software>something',
    })

    // Mock 동작 설정
    jest
      .spyOn(aiService, 'watchAnalysisStatus')
      .mockReturnValue(of(mockCompletedEvent as any))

    jest.spyOn(trxService, 'startTrx').mockImplementation(async (callback) => {
      return await callback({} as any)
    })

    jest.spyOn(projectRepo, 'saveOne').mockResolvedValue(savedProject)
    jest.spyOn(analysisOverviewRepo, 'saveOne').mockResolvedValue(
      new AnalysisOverview({
        projectId: savedProject.id!,
        summary: 'Project summary',
        industryPath: 'tech>software>something',
        review: 'Project review',
        similarServicesScore: 85,
        limitationsScore: 70,
        opportunitiesScore: 90,
        similarServices: [],
        supportPrograms: [],
        targetMarkets: [],
        marketingStrategies: [],
        businessModel: {
          summary: '',
          valueProp: {
            content: '',
            details: [],
          },
          revenue: [],
          investments: [],
        },
        opportunities: [],
        limitations: [],
        teamRequirements: [],
      }),
    )

    jest.spyOn(marketStatsRepo, 'saveOne').mockResolvedValue(
      new MarketStats({
        industryPath: 'tech>software>something',
        score: 80,
        domesticMarketTrends: [],
        globalMarketTrends: [],
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
      }),
    )

    const dto: WatchAnalysisStatusUsecaseDto = { task_id: taskId }

    // 실행 및 검증
    usecase.exec(dto, mockUser).subscribe({
      next: (result) => {
        expect(result).toEqual({
          is_complete: true,
          result: {
            project: {
              id: projectId,
              name: projectName,
            },
          },
        })

        expect(aiService.watchAnalysisStatus).toHaveBeenCalledWith({
          task_id: taskId,
        })
        expect(trxService.startTrx).toHaveBeenCalled()
        expect(projectRepo.saveOne).toHaveBeenCalled()
        expect(analysisOverviewRepo.saveOne).toHaveBeenCalled()
        expect(marketStatsRepo.saveOne).toHaveBeenCalled()

        done()
      },
      error: (error) => done(error),
    })
  })

  it('AI 서비스에서 비성공 이벤트 발생 시 오류 발생', (done) => {
    // 준비
    const taskId = 'task-123'

    // 실패 이벤트 Mock
    const mockFailureEvent = {
      is_success: false,
      status: 500,
    }

    jest
      .spyOn(aiService, 'watchAnalysisStatus')
      .mockReturnValue(of(mockFailureEvent))

    const dto: WatchAnalysisStatusUsecaseDto = { task_id: taskId }

    // 실행 및 검증
    usecase.exec(dto, mockUser).subscribe({
      next: () => {
        done(new Error('이 부분이 실행되면 안됩니다'))
      },
      error: (error) => {
        expect(error).toBeInstanceOf(InternalServerErrorException)
        expect(aiService.watchAnalysisStatus).toHaveBeenCalledWith({
          task_id: taskId,
        })
        done()
      },
    })
  })

  it('AI 서비스 오류 발생 시 BadRequest 예외 처리', (done) => {
    // 준비
    const taskId = 'task-123'

    // 400 에러 Mock
    jest
      .spyOn(aiService, 'watchAnalysisStatus')
      .mockReturnValue(
        throwError(() => ({ status: 400, code: 'INVALID_TASK_ID' })),
      )

    const dto: WatchAnalysisStatusUsecaseDto = { task_id: taskId }

    // 실행 및 검증
    usecase.exec(dto, mockUser).subscribe({
      next: () => {
        done(new Error('이 부분이 실행되면 안됩니다'))
      },
      error: (error) => {
        expect(error).toBeInstanceOf(BadRequestException)
        expect(aiService.watchAnalysisStatus).toHaveBeenCalledWith({
          task_id: taskId,
        })
        done()
      },
    })
  })
})
