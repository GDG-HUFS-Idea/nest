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
import { ProjectRepoPort, PROJECT_REPO } from 'src/port/out/repo/project.repo.port'
import { MarketStatsRepoPort, MARKET_STATS_REPO } from 'src/port/out/repo/marketStats.repo.port'
import { MarketStats } from 'src/domain/marketStats'
import { Project } from 'src/domain/project'

@Injectable()
export class GetAnalysisOverviewUsecase implements GetAnalysisOverviewUsecasePort {
  constructor(
    @Inject(PROJECT_REPO) private readonly projectRepo: ProjectRepoPort,
    @Inject(MARKET_STATS_REPO) private readonly marketStatsRepo: MarketStatsRepoPort,
  ) {}

  async exec(dto: GetAnalysisOverviewUsecaseDto, user: User): Promise<GetAnalysisOverviewUsecaseRes> {
    const project = await this.getProject(dto, user)

    const duration = 5
    const { fromYear, toYear } = this.calFromToYear(duration)
    const marketStats = await this.getMarketStats(project, fromYear, toYear, duration)

    return this.buildRes(project, marketStats)
  }

  private calFromToYear(duration: number) {
    const toYear = new Date().getFullYear()
    const fromYear = toYear - duration + 1
    return { fromYear, toYear }
  }

  private async getProject(dto: GetAnalysisOverviewUsecaseDto, user: User) {
    const project = await this.projectRepo.findOneByIdJoinAnalysisOverview({ id: dto.id }).catch(() => {
      throw new BadGatewayException()
    })

    if (!project) {
      throw new NotFoundException()
    }

    if (project.userId !== user.id) {
      throw new ForbiddenException()
    }
    return project
  }

  private async getMarketStats(project: Project, fromYear: number, toYear: number, duration: number) {
    const marketStats = await this.marketStatsRepo
      .findOneByIndustryPath({ industryPath: project.analysisOverview!.industryPath, fromYear, toYear })
      .catch(() => {
        throw new BadGatewayException()
      })

    if (!marketStats) {
      throw new NotFoundException()
    }

    if (marketStats.domesticMarketTrends.length != duration || marketStats.globalMarketTrends.length != duration) {
      throw new InternalServerErrorException()
    }
    return marketStats
  }

  private buildRes(project: Project, marketStats: MarketStats) {
    return {
      review: project.analysisOverview!.review,
      project: {
        id: project.id!,
        name: project.name,
      },
      market_stats: {
        industry_path: marketStats.industryPath.split('>'),
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
      support_programs: project.analysisOverview!.supportPrograms.map((program) => ({
        name: program.name,
        organizer: program.organizer,
        start_date: program.startDate,
        end_date: program.endDate,
      })),
      target_markets: project.analysisOverview!.targetMarkets.map((market) => ({
        target: market.target,
        order: market.order,
        reasons: market.reason,
        appeal: market.appeal,
        online_activity: market.onlineActivity,
        online_channels: market.onlineChannels,
        offline_channels: market.offlineChannels,
      })),
      business_model: {
        summary: project.analysisOverview!.businessModel.summary,
        value_prop: project.analysisOverview!.businessModel.valueProp,
        revenue: project.analysisOverview!.businessModel.revenue,
        investments: project.analysisOverview!.businessModel.investments.map((investment) => ({
          order: investment.order,
          section: investment.section,
          description: investment.description,
        })),
      },
      opportunity: {
        score: project.analysisOverview!.opportunitiesScore,
        items: project.analysisOverview!.opportunities,
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
      team_requirements: project.analysisOverview!.teamRequirements.map((requirement) => ({
        order: requirement.order,
        title: requirement.title,
        skill: requirement.skill,
        responsibility: requirement.responsibility,
      })),
    }
  }
}
