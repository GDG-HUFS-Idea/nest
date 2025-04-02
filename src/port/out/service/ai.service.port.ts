import { Observable } from 'rxjs'
import { AnalyzeIdeaDto } from 'src/adapter/ai/dto/analyzeIdea.dto'
import { WatchAnalysisStatusDto } from 'src/adapter/ai/dto/watchAnalysisStatus.dto'

export const AI_SERVICE = Symbol('AI_SERVICE')

export interface AiServicePort {
  analyzeIdea(param: {
    problem: string
    motivation: string
    features: string
    method: string
    deliverable: string
  }): Promise<
    | {
        is_success: true
        data: AnalyzeIdeaDto
      }
    | {
        is_success: false
        status: number
        code: number
      }
  >

  watchAnalysisStatus(param: { task_id: string }): Observable<{
    is_success: boolean
    data?: WatchAnalysisStatusDto
    status?: number
    code?: string
  }>
}
