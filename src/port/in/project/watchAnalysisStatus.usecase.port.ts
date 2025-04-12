import { Observable } from 'rxjs'
import { WatchAnalysisStatusUsecaseDto } from 'src/adapter/app/dto/project/watchAnalysisStatus.usecase.dto'

export const WATCH_ANALYSIS_STATUS_USECASE = Symbol('WATCH_ANALYSIS_STATUS_USECASE')

export interface WatchAnalysisStatusUsecasePort {
  exec(dto: WatchAnalysisStatusUsecaseDto, user: User): Promise<Observable<Promise<WatchAnalysisStatusUsecaseRes>>>
}

export type WatchAnalysisStatusUsecaseRes =
  | {
      is_complete: false
      progress: number
      message: string
    }
  | {
      is_complete: true
      result: {
        project: {
          id: number
          name: string
        }
      }
    }
