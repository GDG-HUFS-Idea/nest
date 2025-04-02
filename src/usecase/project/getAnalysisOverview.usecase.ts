import {
  BadGatewayException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { GetAnalysisOverviewUsecaseDto } from 'src/adapter/app/dto/project/getAnalysisOverview.usecase.dto'
import {
  GetAnalysisOverviewUsecasePort,
  GetAnalysisOverviewUsecaseRes,
} from 'src/port/in/project/getAnalysisOverview.usecase.port'
import { ProjectRepoPort } from 'src/port/out/repo/project.repo.port'
import { PROJECT_REPO } from 'src/port/out/repo/project.repo.port'
import { MarketStatsRepoPort } from 'src/port/out/repo/marketStats.repo.port'
import { MARKET_STATS_REPO } from 'src/port/out/repo/marketStats.repo.port'
import { MarketStats } from 'src/domain/marketStats'
import { Project } from 'src/domain/project'

@Injectable()
export class GetAnalysisOverviewUsecase
  implements GetAnalysisOverviewUsecasePort
{
  constructor(
    @Inject(PROJECT_REPO)
    private readonly projectRepo: ProjectRepoPort,
    @Inject(MARKET_STATS_REPO)
    private readonly marketStatsRepo: MarketStatsRepoPort,
  ) {}

  async exec(
    dto: GetAnalysisOverviewUsecaseDto,
    user: User,
  ): Promise<GetAnalysisOverviewUsecaseRes> {
    const project = await this.retrieveProject(dto.id, user.id)
    const marketStats = await this.retrieveMarketStats(
      project.analysisOverview!.industryPath,
    )

    return this.buildRes(project, marketStats)
  }

  // 프로젝트 조회 및 사용자 접근 권한 검증
  private async retrieveProject(projectId: number, userId: number) {
    const project = await this.projectRepo.findOneByIdJoinAnalysisOverview({
      id: projectId,
    })

    if (!project) {
      throw new NotFoundException()
    }

    if (project.userId !== userId) {
      throw new ForbiddenException()
    }

    return project
  }

  // 시장 통계 데이터 조회
  private async retrieveMarketStats(industryPath: string) {
    const duration = 5
    let marketStats: MarketStats | null

    try {
      marketStats = await this.marketStatsRepo.findOneByIndustryPath({
        industryPath: industryPath,
        duration,
      })
    } catch {
      throw new BadGatewayException()
    }

    if (
      marketStats?.domesticMarketTrends.length != duration ||
      marketStats?.globalMarketTrends.length != duration
    ) {
      throw new InternalServerErrorException()
    }
    if (!marketStats) {
      throw new NotFoundException()
    }

    return marketStats
  }

  // 응답 데이터 빌드
  private buildRes(
    project: Project,
    marketStats: MarketStats,
  ):
    | GetAnalysisOverviewUsecaseRes
    | PromiseLike<GetAnalysisOverviewUsecaseRes> {
    return {
      summary: project.analysisOverview!.summary,
      review: project.analysisOverview!.review,
      project: {
        id: project.id!,
        name: project.name,
      },
      market_stats: {
        industry_path: marketStats.industryPath.split(','),
        score: marketStats.score,
        market_trend: {
          domestic: marketStats.domesticMarketTrends.map((trend) => ({
            year: trend.year,
            volume: trend.volume,
            currency: trend.currency,
            growth_rate: trend.growthRate,
            source: trend.source,
          })),
          global: marketStats.globalMarketTrends.map((trend) => ({
            year: trend.year,
            volume: trend.volume,
            currency: trend.currency,
            growth_rate: trend.growthRate,
            source: trend.source,
          })),
        },
        avg_revenue: {
          domestic: {
            amount: marketStats.domesticAvgRevenue.amount,
            currency: marketStats.domesticAvgRevenue.currency,
            source: marketStats.domesticAvgRevenue.source,
          },
          global: {
            amount: marketStats.globalAvgRevenue.amount,
            currency: marketStats.globalAvgRevenue.currency,
            source: marketStats.globalAvgRevenue.source,
          },
        },
      },
      similar_service: {
        score: project.analysisOverview!.similarServicesScore,
        items: project.analysisOverview!.similarServices.map((service) => ({
          description: service.description,
          logo_url: service.logoUrl,
          website_url: service.websiteUrl,
          tags: service.tags,
          summary: service.summary,
        })),
      },
      support_programs: project.analysisOverview!.supportPrograms.map(
        (program) => ({
          name: program.name,
          organizer: program.organizer,
          url: program.url,
          start_date: program.startDate,
          end_date: program.endDate,
        }),
      ),
      target_markets: project.analysisOverview!.targetMarkets.map((market) => ({
        target: market.target,
        icon_url: market.iconUrl,
        order: market.order,
        reasons: market.reasons,
        appeal: market.appeal,
        online_activity: market.onlineActivity,
        online_channels: market.onlineChannels,
        offline_channels: market.offlineChannels,
      })),
      marketing_strategies: project.analysisOverview!.marketingStrategies.map(
        (strategy) => ({
          title: strategy.title,
          details: strategy.details.map((detail) => ({
            label: detail.label,
            description: detail.description,
          })),
        }),
      ),
      business_model: {
        summary: project.analysisOverview!.businessModel.summary,
        value_prop: {
          content: project.analysisOverview!.businessModel.valueProp.content,
          details:
            project.analysisOverview!.businessModel.valueProp.details.map(
              (detail) => ({
                label: detail.label,
                description: detail.description,
              }),
            ),
        },
        revenue: project.analysisOverview!.businessModel.revenue.map(
          (revenue) => ({
            label: revenue.label,
            description: revenue.description,
            details: revenue.details,
          }),
        ),
        investments: project.analysisOverview!.businessModel.investments.map(
          (investment) => ({
            order: investment.order,
            section: investment.section,
            details: investment.details.map((detail) => ({
              label: detail.label,
              description: detail.description,
            })),
          }),
        ),
      },
      opportunity: {
        score: project.analysisOverview!.opportunitiesScore,
        items: project.analysisOverview!.opportunities.map((opportunity) => ({
          title: opportunity.title,
          description: opportunity.description,
        })),
      },
      limitation: {
        score: project.analysisOverview!.limitationsScore,
        items: project.analysisOverview!.limitations.map((limitation) => ({
          category: limitation.category,
          detail: limitation.detail,
          impact: limitation.impact,
          solution: limitation.solution,
        })),
      },
      team_requirements: project.analysisOverview!.teamRequirements.map(
        (teamRequirement) => ({
          order: teamRequirement.order,
          role: teamRequirement.role,
          skills: teamRequirement.skills,
          tasks: teamRequirement.tasks,
          salary_min: teamRequirement.salaryMin,
          salary_max: teamRequirement.salaryMax,
          currency: teamRequirement.currency,
        }),
      ),
    }
  }
}
