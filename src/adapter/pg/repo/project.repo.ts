import { Injectable } from '@nestjs/common'
import { PgService } from '../pg.service'
import * as schema from '../drizzle/schema'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { and, eq, isNull } from 'drizzle-orm'
import { mapAnalysisOverview } from '../mapper/mapAnalysisOverview'
import { mapProject } from '../mapper/mapProject'
import { ProjectRepoPort } from 'src/port/out/repo/project.repo.port'
import { Project } from 'src/domain/project'

@Injectable()
export class ProjectRepo implements ProjectRepoPort {
  constructor(private readonly pgService: PgService) {}

  async findOneById(param: {
    id: number
    ctx?: RdbClient
  }): Promise<Project | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const row = await ctx.query.projects.findFirst({
      where: and(
        eq(schema.projects.id, param.id),
        isNull(schema.projects.deletedAt),
      ),
    })

    if (!row) return null

    return mapProject(row)
  }

  async findOneByIdJoinAnalysisOverview(param: {
    id: number
    ctx?: RdbClient
  }): Promise<Project | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const [row] = await ctx
      .select()
      .from(schema.projects)
      .where(
        and(
          eq(schema.projects.id, param.id),
          isNull(schema.projects.deletedAt),
          isNull(schema.analysisOverview.deletedAt),
        ),
      )
      .innerJoin(
        schema.analysisOverview,
        eq(schema.analysisOverview.projectId, schema.projects.id),
      )

    if (!row) return null

    const project = mapProject(row.projects)
    const analysisOverview = mapAnalysisOverview(row.analysis_overview)
    project.analysisOverview = analysisOverview
    return project
  }

  async findManyByUserId(param: {
    userId: number
    offset: number
    limit: number
    ctx?: RdbClient
  }): Promise<Project[] | null> {
    const ctx = param.ctx ?? this.pgService.getClient()

    const projects = await ctx.query.projects.findMany({
      where: and(
        eq(schema.projects.userId, param.userId),
        isNull(schema.projects.deletedAt),
      ),
      offset: param.offset,
      limit: param.limit,
    })

    if (!projects) return null

    return projects.map(mapProject)
  }
}
