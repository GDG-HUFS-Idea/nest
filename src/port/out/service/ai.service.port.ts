import { Observable } from 'rxjs'
import { AnalyzeIdeaDto } from 'src/adapter/ai/dto/analyzeIdea.dto'
import { WatchAnalysisStatusDto } from 'src/adapter/ai/dto/watchAnalysisStatus.dto'

export const AI_SERVICE = Symbol('AI_SERVICE')

export interface AiServicePort {
  analyzeIdea(param: { problem: string; solution: string }): Promise<
    | {
        is_success: false
        status: number
        code: number
      }
    | {
        is_success: true
        data: AnalyzeIdeaDto
      }
  >

  watchAnalysisStatus(param: { task_id: string }): Observable<
    | {
        is_success: false
        status: number
        code: number
      }
    | { is_success: true; data: WatchAnalysisStatusDto }
  >
}
