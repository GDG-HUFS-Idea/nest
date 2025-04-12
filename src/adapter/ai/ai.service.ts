import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'
import { AnalyzeIdeaDto } from './dto/analyzeIdea.dto'
import { AiServicePort } from 'src/port/out/service/ai.service.port'
import { Observable } from 'rxjs'
import { EventSource } from 'eventsource'
import { WatchAnalysisStatusDto, WatchAnalysisStatusSchema } from './dto/watchAnalysisStatus.dto'

@Injectable()
export class AiService implements AiServicePort {
  private readonly BASE_URL: string

  constructor(private readonly configService: ConfigService) {
    this.BASE_URL = configService.getOrThrow('AI_BASE_URL')
  }

  async analyzeIdea(param: { problem: string; solution: string }) {
    const res = await fetch(`${this.BASE_URL}/analyses/projects/overview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(param),
    })

    const data = await res.json()

    if (!res.ok) {
      return { is_success: false as const, status: res.status, code: data.code }
    }

    const dto = plainToInstance(AnalyzeIdeaDto, data)
    await validateOrReject(dto)

    return { is_success: true as const, data: dto }
  }

  watchAnalysisStatus(param: { task_id: string }) {
    return new Observable<
      { is_success: false; status: number; code: number } | { is_success: true; data: WatchAnalysisStatusDto }
    >((observer) => {
      const eventSource = new EventSource(`${this.BASE_URL}/analyses/projects/overview/status?task_id=${param.task_id}`)

      eventSource.onmessage = (event) => {
        try {
          const dto = WatchAnalysisStatusSchema.parse(JSON.parse(event.data))
          observer.next({ is_success: true, data: dto })

          if (dto.is_complete) {
            eventSource.close()
            observer.complete()
          }
        } catch (error) {
          eventSource.close()
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
      }

      return () => eventSource.close()
    })
  }
}
