import { BadGatewayException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { WatchAnalysisStatusUsecaseDto } from 'src/adapter/app/dto/project/watchAnalysisStatus.usecase.dto'
import {
  WatchAnalysisStatusUsecasePort,
  WatchAnalysisStatusUsecaseRes,
} from 'src/port/in/project/watchAnalysisStatus.usecase.port'
import { AI_SERVICE, AiServicePort } from 'src/port/out/service/ai.service.port'
import { Observable, map, of } from 'rxjs'
import { PROJECT_REPO, ProjectRepoPort } from 'src/port/out/repo/project.repo.port'
import { ANALYSIS_OVERVIEW_REPO, AnalysisOverviewRepoPort } from 'src/port/out/repo/analysisOverview.repo.port'
import { MARKET_STATS_REPO, MarketStatsRepoPort } from 'src/port/out/repo/marketStats.repo.port'
import { TRX_SERVICE, TrxServicePort } from 'src/port/out/service/trx.service.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { Project } from 'src/domain/project'
import { AnalysisOverview } from 'src/domain/analysisOverview'
import { MarketStats } from 'src/domain/marketStats'
import { WatchAnalysisStatusDto } from 'src/adapter/ai/dto/watchAnalysisStatus.dto'

@Injectable()
export class WatchAnalysisStatusUsecase implements WatchAnalysisStatusUsecasePort {
  constructor(
    @Inject(AI_SERVICE) private readonly aiService: AiServicePort,
    @Inject(PROJECT_REPO) private readonly projectRepo: ProjectRepoPort,
    @Inject(ANALYSIS_OVERVIEW_REPO) private readonly analysisOverviewRepo: AnalysisOverviewRepoPort,
    @Inject(MARKET_STATS_REPO) private readonly marketStatsRepo: MarketStatsRepoPort,
    @Inject(TRX_SERVICE) private readonly trxService: TrxServicePort,
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
  ) {}

  async exec(
    dto: WatchAnalysisStatusUsecaseDto,
    user: User,
  ): Promise<Observable<Promise<WatchAnalysisStatusUsecaseRes>>> {
    const task = await this.cacheRepo.getTask({ taskId: dto.task_id, userId: user.id })

    // 해당 작업이 존재하지 않거나 만료된 경우
    if (!task) {
      throw new NotFoundException()
    }

    // 이미 완료된 작업이고 결과가 있는 경우
    if (task.is_complete && task.result) {
      return of(
        Promise.resolve({
          is_complete: true as const,
          result: task.result,
        }),
      )
    }

    return this.aiService.watchAnalysisStatus({ task_id: dto.task_id }).pipe(
      map(async (res) => {
        if (!res.is_success) {
          throw new BadGatewayException()
        }

        const data = res.data

        // 분석이 아직 진행 중인 경우
        if (!data.is_complete) {
          return {
            is_complete: false as const,
            progress: data.progress!,
            message: data.message!,
          }
        }
        // 분석이 완료되고 결과가 나온 경우
        else if (data.is_complete && data.result) {
          const { id, name } = await this.trxSaveResult(user, data.result)

          await this.setTaskCache(dto, user, id, name)

          return {
            is_complete: true as const,
            result: { project: { id, name } },
          }
        } else {
          throw new BadGatewayException()
        }
      }),
    )
  }

  private async trxSaveResult(
    user: User,
    result: NonNullable<WatchAnalysisStatusDto['result']>,
  ): Promise<{ id: any; name: any }> {
    return await this.trxService.startTrx(async (trxCtx) => {
      const industryPath = `${result.ksicHierarchy.large.name}>${result.ksicHierarchy.medium.name}>${result.ksicHierarchy.small.name}>${result.ksicHierarchy.detail.name}`

      // project 저장
      const project = new Project({ userId: user.id, name: result.oneLineReview, industryPath })
      const savedProject = await this.projectRepo.saveOne({ project: project, ctx: trxCtx }).catch(() => {
        throw new BadGatewayException()
      })

      if (!savedProject) {
        throw new BadGatewayException()
      }

      // analysisOverview 저장
      const analysisOverview = this.mapAnalysisOverview(savedProject, result, industryPath)
      const savedAnalysisOverview = await this.analysisOverviewRepo
        .saveOne({ analysisOverview, ctx: trxCtx })
        .catch(() => {
          throw new BadGatewayException()
        })

      if (!savedAnalysisOverview) {
        throw new BadGatewayException()
      }

      // marketStats 저장
      const marketStats = this.mapMarketStats(industryPath, result)
      const savedMarketStats = await this.marketStatsRepo.saveOne({ marketStats, ctx: trxCtx }).catch(() => {
        throw new BadGatewayException()
      })

      if (!savedMarketStats) {
        throw new BadGatewayException()
      }

      return {
        id: savedProject.id!,
        name: savedAnalysisOverview.summary,
      }
    })
  }

  private async setTaskCache(dto: WatchAnalysisStatusUsecaseDto, user: User, id: number, name: string) {
    await this.cacheRepo.setTask({
      taskId: dto.task_id,
      userId: user.id,
      task: {
        is_complete: true,
        result: { project: { id, name } },
      },
      ttl: 60 * 2, // 2분
    })
  }

  private mapMarketStats(industryPath: string, result: NonNullable<WatchAnalysisStatusDto['result']>) {
    return new MarketStats({
      industryPath,
      score: result.scores.market,
      domesticMarketTrends: result.marketSizeByYear.domestic.items.map((marketTrend) => ({
        year: marketTrend.year,
        volume: marketTrend.size.volume,
        currency: marketTrend.size.currency,
        growthRate: marketTrend.growthRate,
        source: result.marketSizeByYear.domestic.source.source,
      })),
      globalMarketTrends: result.marketSizeByYear.global.items.map((marketTrend) => ({
        year: marketTrend.year,
        volume: marketTrend.size.volume,
        currency: marketTrend.size.currency,
        growthRate: marketTrend.growthRate,
        source: result.marketSizeByYear.global.source.source,
      })),
      domesticAvgRevenue: {
        amount: result.averageRevenue.domestic.volume,
        currency: result.averageRevenue.domestic.currency,
        source: result.averageRevenue.source,
      },
      globalAvgRevenue: {
        amount: result.averageRevenue.global.volume,
        currency: result.averageRevenue.global.currency,
        source: result.averageRevenue.source,
      },
    })
  }

  private mapAnalysisOverview(
    savedProject: Project,
    result: NonNullable<WatchAnalysisStatusDto['result']>,
    industryPath: string,
  ) {
    return new AnalysisOverview({
      projectId: savedProject.id!,
      summary: result.oneLineReview,
      industryPath,
      review: result.oneLineReview,
      similarServicesScore: result.scores.similarService,
      limitationsScore: result.scores.risk,
      opportunitiesScore: result.scores.opportunity,
      similarServices: result.similarServices || [],
      supportPrograms: result.supportPrograms.map((program) => ({
        name: program.name,
        organizer: program.organization,
        startDate: program.period.startDate ? new Date(program.period.startDate) : undefined,
        endDate: program.period.endDate ? new Date(program.period.endDate) : undefined,
      })),
      targetMarkets: result.targetAudience.map((targetAudience, i) => ({
        order: i,
        target: targetAudience.segment,
        reason: targetAudience.reasons,
        appeal: targetAudience.interestFactors,
        onlineActivity: targetAudience.onlineActivities,
        onlineChannels: targetAudience.onlineTouchpoints,
        offlineChannels: targetAudience.offlineTouchpoints,
      })),
      businessModel: {
        summary: result.businessModel.tagline,
        valueProp: result.businessModel.valueDetails,
        revenue: result.businessModel.revenueStructure,
        investments: result.businessModel.investmentPriorities.map((investment, i) => ({
          order: i,
          section: investment.name,
          description: investment.description,
        })),
      },
      opportunities: result.opportunities,
      limitations: result.limitations.map((limitation) => ({
        category: limitation.category,
        detail: limitation.details,
        impact: limitation.impact,
        solution: limitation.solution,
      })),
      teamRequirements: result.requiredTeam.roles.map((requirement) => ({
        order: requirement.priority,
        skill: requirement.skills,
        title: requirement.title,
        responsibility: requirement.responsibilities,
      })),
    })
  }
}
