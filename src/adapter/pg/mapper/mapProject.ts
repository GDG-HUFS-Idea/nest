import { Project } from 'src/domain/project'
import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'

export const mapProject = (project: InferSelectModel<typeof schema.projects>) =>
  new Project({
    id: project.id,
    userId: project.userId,
    name: project.name,
    industryPath: project.industryPath,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    deletedAt: project.deletedAt || undefined,
  })
