import { Injectable } from '@nestjs/common'
import { PgService } from '../pg.service'
import * as schema from '../drizzle/schema'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { and, eq, isNull, desc } from 'drizzle-orm'
import { mapProject } from '../mapper/mapProject'
import { ProjectRepoPort } from 'src/port/out/repo/project.repo.port'
import { Project } from 'src/domain/project'
import { mapAnalysisOverview } from '../mapper/mapAnalysisOverview'

@Injectable()
export class ProjectRepo implements ProjectRepoPort {
  constructor(private readonly pgService: PgService) {}

  async saveOne(param: {
    project: Project
    ctx?: RdbClient
  }): Promise<Project | null> {
    const ctx = param.ctx ?? this.pgService.getClient()
    const project = param.project

    if (project.id) {
      const [updatedProject] = await ctx
        .update(schema.projects)
        .set({
          name: project.name,
          industryPath: project.industryPath,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.projects.id, project.id),
            isNull(schema.projects.deletedAt),
          ),
        )
        .returning()

      if (!updatedProject) return null
      return mapProject(updatedProject)
    } else {
      const [newProject] = await ctx
        .insert(schema.projects)
        .values({
          userId: project.userId,
          name: project.name,
          industryPath: project.industryPath,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      if (!newProject) return null
      return mapProject(newProject)
    }
  }

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
        ),
      )
      .leftJoin(
        schema.analysisOverview,
        and(
          eq(schema.analysisOverview.projectId, schema.projects.id),
          isNull(schema.analysisOverview.deletedAt),
        ),
      )

    if (!row) return null

    const project = mapProject(row.projects)

    if (row.analysis_overview) {
      const analysisOverview = mapAnalysisOverview(row.analysis_overview)
      project.analysisOverview = analysisOverview
    }

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
      orderBy: desc(schema.projects.createdAt),
    })

    if (!projects.length) return null

    return projects.map(mapProject)
  }
}
