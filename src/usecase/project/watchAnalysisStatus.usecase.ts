import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { WatchAnalysisStatusUsecaseDto } from 'src/adapter/app/dto/project/watchAnalysisStatus.usecase.dto'
import {
  WatchAnalysisStatusUsecasePort,
  WatchAnalysisStatusUsecaseRes,
} from 'src/port/in/project/watchAnalysisStatus.usecase.port'
import { AI_SERVICE, AiServicePort } from 'src/port/out/service/ai.service.port'
import { Observable, catchError, throwError, switchMap, from } from 'rxjs'
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
import { Project } from 'src/domain/project'
import { AnalysisOverview } from 'src/domain/analysisOverview'
import { MarketStats } from 'src/domain/marketStats'
import { Currency } from 'src/shared/enum/enum'
import {
  TRX_SERVICE,
  TrxServicePort,
} from 'src/port/out/service/trx.service.port'

@Injectable()
export class WatchAnalysisStatusUsecase
  implements WatchAnalysisStatusUsecasePort
{
  constructor(
    @Inject(AI_SERVICE) private readonly aiService: AiServicePort,
    @Inject(PROJECT_REPO) private readonly projectRepo: ProjectRepoPort,
    @Inject(ANALYSIS_OVERVIEW_REPO)
    private readonly analysisOverviewRepo: AnalysisOverviewRepoPort,
    @Inject(MARKET_STATS_REPO)
    private readonly marketStatsRepo: MarketStatsRepoPort,
    @Inject(TRX_SERVICE) private readonly trxService: TrxServicePort,
  ) {}

  // 분석 상태 스트림 생성 및 상태 이벤트 처리
  exec(
    dto: WatchAnalysisStatusUsecaseDto,
    user: User,
  ): Observable<WatchAnalysisStatusUsecaseRes> {
    return this.createStatusStream(dto.task_id, user)
  }

  // 분석 상태 스트림 생성
  private createStatusStream(
    taskId: string,
    user: User,
  ): Observable<WatchAnalysisStatusUsecaseRes> {
    try {
      return this.aiService.watchAnalysisStatus({ task_id: taskId }).pipe(
        switchMap((event) => {
          if (!event.is_success) {
            throw { status: event.status, code: event.code }
          }
          return from(this.processStatusEvent(event.data, user))
        }),
        catchError((err) => this.handleStreamError(err)),
      )
    } catch {
      throw new InternalServerErrorException()
    }
  }

  // 상태 이벤트 처리
  private async processStatusEvent(
    event: any,
    user: User,
  ): Promise<WatchAnalysisStatusUsecaseRes> {
    // 완료되지 않은 이벤트 처리
    if (event.status !== 'completed') {
      return this.buildProgressResponse(event)
    }

    // 완료된 이벤트 처리
    try {
      await this.saveAnalysisData(event.result, user)
    } catch (error) {
      // TODO: 저장 시 에러 응답 처리
    }

    return this.buildCompletionResponse(event.result)
  }

  // 진행 중인 상태 응답 생성
  private buildProgressResponse(event: any): WatchAnalysisStatusUsecaseRes {
    return {
      is_complete: false,
      progress: event.progress,
      message: event.message,
    }
  }

  // 완료 상태 응답 생성
  private buildCompletionResponse(result: any): WatchAnalysisStatusUsecaseRes {
    return {
      is_complete: true,
      result: {
        project: {
          id: result.project.id,
          name: result.project.name,
        },
      },
    }
  }

  // 스트림 에러 처리
  private handleStreamError(error: any) {
    if (error.status === 400) {
      return throwError(() => new BadRequestException({ code: error.code }))
    }
    return throwError(() => new InternalServerErrorException())
  }

  // 분석 데이터 저장 (트랜잭션)
  private async saveAnalysisData(result: any, user: User): Promise<void> {
    await this.trxService.startTrx(async (ctx) => {
      // 프로젝트 저장
      const project = this.createProjectEntity(result, user)
      const savedProject = await this.projectRepo
        .saveOne({ project, ctx })
        .catch(() => {
          throw new BadGatewayException()
        })

      // 분석 개요 저장
      const analysisOverview = this.createAnalysisOverviewEntity(
        savedProject!,
        result,
      )
      await this.analysisOverviewRepo
        .saveOne({ analysisOverview, ctx })
        .catch(() => {
          throw new BadGatewayException()
        })

      // 시장 통계 저장
      const marketStats = this.createMarketStatsEntity(result)
      await this.marketStatsRepo.saveOne({ marketStats, ctx }).catch(() => {
        throw new BadGatewayException()
      })
    })
  }

  // 프로젝트 엔티티 생성
  private createProjectEntity(result: any, user: User): Project {
    return new Project({
      id: result.project.id || undefined,
      userId: user.id,
      name: result.project.name,
      industryPath: result.industryPath,
    })
  }

  // 분석 개요 엔티티 생성
  private createAnalysisOverviewEntity(
    savedProject: Project,
    result: any,
  ): AnalysisOverview {
    return new AnalysisOverview({
      projectId: savedProject.id!,
      summary: result.summary,
      industryPath: result.industryPath,
      review: result.review,
      similarServicesScore: result.similarServicesScore,
      limitationsScore: result.limitationsScore,
      opportunitiesScore: result.opportunitiesScore,
      similarServices: result.similarServices,
      supportPrograms: result.supportPrograms,
      targetMarkets: result.targetMarkets,
      marketingStrategies: result.marketingStrategies,
      businessModel: result.businessModel,
      opportunities: result.opportunities,
      limitations: result.limitations,
      teamRequirements: result.teamRequirements,
      id: result.analysisOverviewId || undefined,
    })
  }

  // 시장 통계 엔티티 생성
  private createMarketStatsEntity(result: any): MarketStats {
    return new MarketStats({
      industryPath: result.industryPath,
      score: result.marketStats.score || 0,
      domesticMarketTrends: result.marketStats.domesticMarketTrends || [],
      globalMarketTrends: result.marketStats.globalMarketTrends || [],
      domesticAvgRevenue: result.marketStats.domesticAvgRevenue || {
        amount: 0,
        currency: Currency.KRW,
        source: '',
      },
      globalAvgRevenue: result.marketStats.globalAvgRevenue || {
        amount: 0,
        currency: Currency.USD,
        source: '',
      },
      id: result.marketStats.id || undefined,
    })
  }
}
