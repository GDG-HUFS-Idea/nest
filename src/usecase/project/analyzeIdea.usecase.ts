import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { AnalyzeIdeaUsecaseDto } from 'src/adapter/app/dto/project/analyzeIdea.usecase.dto'
import {
  AnalyzeIdeaUsecasePort,
  AnalyzeIdeaUsecaseRes,
} from 'src/port/in/project/analyzeIdea.usecase.port'
import { AI_SERVICE, AiServicePort } from 'src/port/out/service/ai.service.port'

@Injectable()
export class AnalyzeIdeaUsecase implements AnalyzeIdeaUsecasePort {
  constructor(@Inject(AI_SERVICE) private readonly aiService: AiServicePort) {}

  // AI 서비스로 아이디어 분석 요청 및 태스크 ID 반환
  async exec(
    dto: AnalyzeIdeaUsecaseDto,
    user: User,
  ): Promise<AnalyzeIdeaUsecaseRes> {
    const aiResponse = await this.requestIdeaAnalysis(dto)
    return { task_id: aiResponse.task_id }
  }

  // AI 서비스에 아이디어 분석 요청
  private async requestIdeaAnalysis(dto: AnalyzeIdeaUsecaseDto) {
    try {
      const res = await this.aiService.analyzeIdea({
        problem: dto.problem,
        motivation: dto.motivation,
        features: dto.features,
        method: dto.method,
        deliverable: dto.deliverable,
      })

      if (!res.is_success) {
        if (res.status === 400) {
          throw new BadRequestException({ code: res.code })
        }
        throw new BadGatewayException()
      }

      return res.data
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadGatewayException()
    }
  }
}
