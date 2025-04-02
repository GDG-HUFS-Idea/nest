import { Injectable } from '@nestjs/common'
import { AnalysisOverviewRepoPort } from 'src/port/out/repo/analysisOverview.repo.port'
import { PgService } from '../pg.service'
import * as schema from '../drizzle/schema'
import { AnalysisOverview } from 'src/domain/analysisOverview'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { and, eq, isNull } from 'drizzle-orm'
import { mapAnalysisOverview } from '../mapper/mapAnalysisOverview'
import { mapProject } from '../mapper/mapProject'

@Injectable()
export class AnalysisOverviewRepo implements AnalysisOverviewRepoPort {
  constructor(private readonly pgService: PgService) {}

  async saveOne(param: {
    analysisOverview: AnalysisOverview
    ctx?: RdbClient
  }): Promise<AnalysisOverview> {
    const ctx = param.ctx ?? this.pgService.getClient()
    const analysisOverview = param.analysisOverview

    if (analysisOverview.id) {
      const [updatedAnalysis] = await ctx
        .update(schema.analysisOverview)
        .set({
          summary: analysisOverview.summary,
          industryPath: analysisOverview.industryPath,
          review: analysisOverview.review,
          similarServicesScore: analysisOverview.similarServicesScore,
          limitationsScore: analysisOverview.limitationsScore,
          opportunitiesScore: analysisOverview.opportunitiesScore,
          similarServices: analysisOverview.similarServices,
          supportPrograms: analysisOverview.supportPrograms,
          targetMarkets: analysisOverview.targetMarkets,
          marketingStrategies: analysisOverview.marketingStrategies,
          businessModel: analysisOverview.businessModel,
          opportunities: analysisOverview.opportunities,
          limitations: analysisOverview.limitations,
          teamRequirements: analysisOverview.teamRequirements,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.analysisOverview.id, analysisOverview.id),
            isNull(schema.analysisOverview.deletedAt),
          ),
        )
        .returning()

      if (!updatedAnalysis) {
        throw new Error('Analysis overview update failed')
      }

      return mapAnalysisOverview(updatedAnalysis)
    } else {
      const [newAnalysis] = await ctx
        .insert(schema.analysisOverview)
        .values({
          projectId: analysisOverview.projectId,
          summary: analysisOverview.summary,
          industryPath: analysisOverview.industryPath,
          review: analysisOverview.review,
          similarServicesScore: analysisOverview.similarServicesScore,
          limitationsScore: analysisOverview.limitationsScore,
          opportunitiesScore: analysisOverview.opportunitiesScore,
          similarServices: analysisOverview.similarServices,
          supportPrograms: analysisOverview.supportPrograms,
          targetMarkets: analysisOverview.targetMarkets,
          marketingStrategies: analysisOverview.marketingStrategies,
          businessModel: analysisOverview.businessModel,
          opportunities: analysisOverview.opportunities,
          limitations: analysisOverview.limitations,
          teamRequirements: analysisOverview.teamRequirements,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      if (!newAnalysis) {
        throw new Error('Analysis overview insertion failed')
      }

      return mapAnalysisOverview(newAnalysis)
    }
  }

  async findOneByIdJoinProject(param: {
    id: number
    ctx?: RdbClient
  }): Promise<AnalysisOverview | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const [row] = await ctx
      .select()
      .from(schema.analysisOverview)
      .where(
        and(
          eq(schema.analysisOverview.id, param.id),
          isNull(schema.analysisOverview.deletedAt),
        ),
      )
      .leftJoin(
        schema.projects,
        and(
          eq(schema.analysisOverview.projectId, schema.projects.id),
          isNull(schema.projects.deletedAt),
        ),
      )

    if (!row) return null

    const analysisOverview = mapAnalysisOverview(row.analysis_overview)

    if (row.projects) {
      const project = mapProject(row.projects)
      analysisOverview.project = project
    }

    return analysisOverview
  }
}
