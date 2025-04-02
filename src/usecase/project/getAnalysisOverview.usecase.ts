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
import {
  ProjectRepoPort,
  PROJECT_REPO,
} from 'src/port/out/repo/project.repo.port'
import {
  MarketStatsRepoPort,
  MARKET_STATS_REPO,
} from 'src/port/out/repo/marketStats.repo.port'
import { MarketStats } from 'src/domain/marketStats'
import { Project } from 'src/domain/project'

@Injectable()
export class GetAnalysisOverviewUsecase
  implements GetAnalysisOverviewUsecasePort
{
  constructor(
    @Inject(PROJECT_REPO) private readonly projectRepo: ProjectRepoPort,
    @Inject(MARKET_STATS_REPO)
    private readonly marketStatsRepo: MarketStatsRepoPort,
  ) {}

  // 프로젝트와 시장 통계 정보를 조회하여 분석 개요 응답 반환
  async exec(
    dto: GetAnalysisOverviewUsecaseDto,
    user: User,
  ): Promise<GetAnalysisOverviewUsecaseRes> {
    const project = await this.retrieveProject(dto.id, user.id)
    const marketStats = await this.retrieveMarketStats(
      project.analysisOverview!.industryPath,
    )

    return this.buildResponse(project, marketStats)
  }

  // 프로젝트 조회 및 접근 권한 검증
  private async retrieveProject(
    projectId: number,
    userId: number,
  ): Promise<Project> {
    try {
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error
      }
      throw new BadGatewayException()
    }
  }

  // 시장 통계 데이터 조회 및 유효성 검증
  private async retrieveMarketStats(
    industryPath: string,
  ): Promise<MarketStats> {
    const duration = 5
    const currentYear = new Date().getFullYear()
    const fromYear = currentYear - duration + 1
    const toYear = currentYear

    try {
      const marketStats = await this.marketStatsRepo.findOneByIndustryPath({
        industryPath,
        fromYear,
        toYear,
      })

      if (!marketStats) {
        throw new NotFoundException()
      }

      // 국내 및 글로벌 시장 트렌드가 모두 duration 개수만큼 있는지 확인
      if (
        marketStats.domesticMarketTrends.length != duration ||
        marketStats.globalMarketTrends.length != duration
      ) {
        throw new InternalServerErrorException()
      }

      return marketStats
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error
      }
      throw new BadGatewayException()
    }
  }

  // 응답 데이터 구성
  private buildResponse(
    project: Project,
    marketStats: MarketStats,
  ): GetAnalysisOverviewUsecaseRes {
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
        (requirement) => ({
          order: requirement.order,
          role: requirement.role,
          skills: requirement.skills,
          tasks: requirement.tasks,
          salary_min: requirement.salaryMin,
          salary_max: requirement.salaryMax,
          currency: requirement.currency,
        }),
      ),
    }
  }
}
