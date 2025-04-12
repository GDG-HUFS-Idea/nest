import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { AnalyzeIdeaUsecaseDto } from 'src/adapter/app/dto/project/analyzeIdea.usecase.dto'
import { AnalyzeIdeaUsecasePort, AnalyzeIdeaUsecaseRes } from 'src/port/in/project/analyzeIdea.usecase.port'
import { CACHE_REPO, CacheRepoPort } from 'src/port/out/repo/cache.repo.port'
import { AI_SERVICE, AiServicePort } from 'src/port/out/service/ai.service.port'

@Injectable()
export class AnalyzeIdeaUsecase implements AnalyzeIdeaUsecasePort {
  constructor(
    @Inject(AI_SERVICE) private readonly aiService: AiServicePort,
    @Inject(CACHE_REPO) private readonly cacheRepo: CacheRepoPort,
  ) {}

  async exec(dto: AnalyzeIdeaUsecaseDto, user: User): Promise<AnalyzeIdeaUsecaseRes> {
    const taskId = await this.startAnalysis(dto)
    await this.setTaskCache(taskId, user)
    return { task_id: taskId }
  }

  private async setTaskCache(taskId: string, user: User) {
    await this.cacheRepo.setTask({
      taskId,
      userId: user.id,
      task: { is_complete: false },
      ttl: 60 * 20,
    })
  }

  private async startAnalysis(dto: AnalyzeIdeaUsecaseDto) {
    const aiRes = await this.aiService.analyzeIdea({
      problem: dto.problem,
      solution: dto.solution,
    })

    if (!aiRes.is_success) {
      throw new BadRequestException({ code: aiRes.code })
    }

    const taskId = aiRes.data.task_id
    return taskId
  }
}
