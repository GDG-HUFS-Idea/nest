import { Project } from 'src/domain/project'
import { RdbClient } from 'src/shared/type/rdbClient.type'

export const PROJECT_REPO = Symbol('PROJECT_REPO')

export interface ProjectRepoPort {
  findOneById(param: { id: number; ctx?: RdbClient }): Promise<Project | null>

  findManyByUserId(param: {
    userId: number
    offset: number
    limit: number
    ctx?: RdbClient
  }): Promise<Project[] | null>

  findOneByIdJoinAnalysisOverview(param: {
    id: number
    ctx?: RdbClient
  }): Promise<Project | null>
}
