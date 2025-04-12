import { AnalysisOverview } from 'src/domain/analysisOverview'
import { RdbClient } from 'src/shared/type/rdbClient.type'

export const ANALYSIS_OVERVIEW_REPO = Symbol('ANALYSIS_OVERVIEW_REPO')

export interface AnalysisOverviewRepoPort {
  findOneByIdJoinProject(param: { id: number; ctx?: RdbClient }): Promise<AnalysisOverview | null>

  saveOne(param: { analysisOverview: AnalysisOverview; ctx?: RdbClient }): Promise<AnalysisOverview>

  deleteByProjectId(param: { projectId: number; ctx?: RdbClient }): Promise<void>
}
