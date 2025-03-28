import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'
import { AnalysisOverview } from 'src/domain/analysisOverview'

export const mapAnalysisOverview = (
  analysisOverview: InferSelectModel<typeof schema.analysisOverview>,
) =>
  new AnalysisOverview({
    id: analysisOverview.id,
    projectId: analysisOverview.projectId,
    summary: analysisOverview.summary,
    industryPath: analysisOverview.industryPath,
    review: analysisOverview.review,
    similarServicesScore: analysisOverview.similarServicesScore,
    limitationsScore: analysisOverview.limitationsScore,
    opportunitiesScore: analysisOverview.opportunitiesScore,

    similarServices: (analysisOverview.similarServices || []).map(
      (service) => ({
        description: service.description,
        logoUrl: service.logo_url,
        websiteUrl: service.website_url,
        tags: service.tags,
        summary: service.summary,
      }),
    ),

    supportPrograms: (analysisOverview.supportPrograms || []).map(
      (program) => ({
        name: program.name,
        organizer: program.organizer,
        url: program.url,
        startDate: new Date(program.start_date),
        endDate: new Date(program.end_date),
      }),
    ),

    targetMarkets: (analysisOverview.targetMarkets || [])
      .map((market) => ({
        target: market.target,
        iconUrl: market.icon_url,
        order: market.order,
        reasons: market.reasons,
        appeal: market.appeal,
        onlineActivity: market.online_activity,
        onlineChannels: market.online_channels,
        offlineChannels: market.offline_channels,
      }))
      .sort((a, b) => a.order - b.order),

    marketingStrategies: analysisOverview.marketingStrategies || [],

    businessModel: {
      summary: analysisOverview.businessModel.summary,
      valueProp: {
        content: analysisOverview.businessModel.value_prop.content,
        details: analysisOverview.businessModel.value_prop.details,
      },
      revenue: analysisOverview.businessModel.revenue.map((item) => ({
        label: item.label,
        description: item.description,
        details: item.details,
      })),
      investments: analysisOverview.businessModel.investments
        .map((item) => ({
          order: item.order,
          section: item.section,
          details: item.details,
        }))
        .sort((a, b) => a.order - b.order),
    },

    opportunities: analysisOverview.opportunities || [],

    limitations: analysisOverview.limitations || [],

    teamRequirements: (analysisOverview.teamRequirements || [])
      .map((requirement) => ({
        order: requirement.order,
        role: requirement.role,
        skills: requirement.skills,
        tasks: requirement.tasks,
        salaryMin: requirement.salary_min,
        salaryMax: requirement.salary_max,
        currency: requirement.currency,
      }))
      .sort((a, b) => a.order - b.order),

    createdAt: analysisOverview.createdAt,
    updatedAt: analysisOverview.updatedAt,
    deletedAt: analysisOverview.deletedAt || undefined,
  })
