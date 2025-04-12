import { BadGatewayException, Injectable } from '@nestjs/common'
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

  async saveOne(param: { analysisOverview: AnalysisOverview; ctx?: RdbClient }): Promise<AnalysisOverview> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const [savedAnalysis] = await ctx
      .insert(schema.analysisOverview)
      .values({
        projectId: param.analysisOverview.projectId,
        summary: param.analysisOverview.summary,
        industryPath: param.analysisOverview.industryPath,
        review: param.analysisOverview.review,
        similarServicesScore: param.analysisOverview.similarServicesScore,
        limitationsScore: param.analysisOverview.limitationsScore,
        opportunitiesScore: param.analysisOverview.opportunitiesScore,
        similarServices: param.analysisOverview.similarServices,
        supportPrograms: param.analysisOverview.supportPrograms,
        targetMarkets: param.analysisOverview.targetMarkets,
        businessModel: param.analysisOverview.businessModel,
        opportunities: param.analysisOverview.opportunities,
        limitations: param.analysisOverview.limitations,
        teamRequirements: param.analysisOverview.teamRequirements,
      })
      .returning()

    return mapAnalysisOverview(savedAnalysis)
  }

  async findOneByIdJoinProject(param: { id: number; ctx?: RdbClient }): Promise<AnalysisOverview | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const [row] = await ctx
      .select()
      .from(schema.analysisOverview)
      .where(and(eq(schema.analysisOverview.id, param.id), isNull(schema.analysisOverview.deletedAt)))
      .leftJoin(
        schema.projects,
        and(eq(schema.analysisOverview.projectId, schema.projects.id), isNull(schema.projects.deletedAt)),
      )

    if (!row) return null

    const analysisOverview = mapAnalysisOverview(row.analysis_overview)

    if (row.projects) {
      const project = mapProject(row.projects)
      analysisOverview.project = project
    }

    return analysisOverview
  }

  async deleteByProjectId(param: { projectId: number; ctx?: RdbClient }) {
    const ctx = param.ctx ?? this.pgService.getClient()

    await ctx
      .update(schema.analysisOverview)
      .set({ deletedAt: new Date() })
      .where(and(eq(schema.analysisOverview.projectId, param.projectId), isNull(schema.analysisOverview.deletedAt)))
  }
}
