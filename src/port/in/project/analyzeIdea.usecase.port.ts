import { AnalyzeIdeaUsecaseDto } from 'src/adapter/app/dto/project/analyzeIdea.usecase.dto'

export const ANALYZE_IDEA_USECASE = Symbol('ANALYZE_IDEA_USECASE')

export interface AnalyzeIdeaUsecasePort {
  exec(dto: AnalyzeIdeaUsecaseDto, user: User): Promise<AnalyzeIdeaUsecaseRes>
}

export type AnalyzeIdeaUsecaseRes = {
  task_id: string
}
