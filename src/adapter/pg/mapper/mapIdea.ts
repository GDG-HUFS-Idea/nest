import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'
import { Idea } from 'src/domain/idea'

export const mapIdea = (idea: InferSelectModel<typeof schema.ideas>) =>
  new Idea({
    id: idea.id,
    projectId: idea.projectId,
    problem: idea.problem,
    solution: idea.solution,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
    deletedAt: idea.deletedAt || undefined,
  })
