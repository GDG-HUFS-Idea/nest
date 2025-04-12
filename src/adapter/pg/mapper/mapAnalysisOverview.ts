import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'
import { AnalysisOverview } from 'src/domain/analysisOverview'

export const mapAnalysisOverview = (analysisOverview: InferSelectModel<typeof schema.analysisOverview>) =>
  new AnalysisOverview({
    id: analysisOverview.id,
    projectId: analysisOverview.projectId,
    summary: analysisOverview.summary,
    industryPath: analysisOverview.industryPath,
    review: analysisOverview.review,
    similarServicesScore: analysisOverview.similarServicesScore,
    limitationsScore: analysisOverview.limitationsScore,
    opportunitiesScore: analysisOverview.opportunitiesScore,

    similarServices: analysisOverview.similarServices.map((service) => ({
      description: service.description,
      logoUrl: service.logoUrl,
      websiteUrl: service.websiteUrl,
      tags: service.tags,
      summary: service.summary,
    })),

    supportPrograms: analysisOverview.supportPrograms.map((program) => ({
      name: program.name,
      organizer: program.organizer,
      startDate: program.startDate ? new Date(program.startDate) : undefined,
      endDate: program.endDate ? new Date(program.endDate) : undefined,
    })),

    targetMarkets: analysisOverview.targetMarkets
      .map((market) => ({
        target: market.target,
        order: market.order,
        reason: market.reason,
        appeal: market.appeal,
        onlineActivity: market.onlineActivity,
        onlineChannels: market.onlineChannels,
        offlineChannels: market.offlineChannels,
      }))
      .sort((a, b) => a.order - b.order),

    businessModel: {
      summary: analysisOverview.businessModel.summary,
      valueProp: analysisOverview.businessModel.valueProp,
      revenue: analysisOverview.businessModel.revenue,
      investments: analysisOverview.businessModel.investments
        .map((item) => ({
          order: item.order,
          section: item.section,
          description: item.description,
        }))
        .sort((a, b) => a.order - b.order),
    },

    opportunities: analysisOverview.opportunities,

    limitations: analysisOverview.limitations,

    teamRequirements: analysisOverview.teamRequirements
      .map((requirement) => ({
        order: requirement.order,
        title: requirement.title,
        skill: requirement.skill,
        responsibility: requirement.responsibility,
      }))
      .sort((a, b) => a.order - b.order),

    createdAt: analysisOverview.createdAt,
    updatedAt: analysisOverview.updatedAt,
    deletedAt: analysisOverview.deletedAt || undefined,
  })
