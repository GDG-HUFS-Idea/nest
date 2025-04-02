import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToInstance } from 'class-transformer'
import { WatchAnalysisStatusDto } from './dto/watchAnalysisStatus.dto'
import { validateOrReject } from 'class-validator'
import { AnalyzeIdeaDto } from './dto/analyzeIdea.dto'
import { AiServicePort } from 'src/port/out/service/ai.service.port'
import { Observable } from 'rxjs'

@Injectable()
export class AiService implements AiServicePort {
  private readonly baseUrl: string

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.getOrThrow('AI_BASE_URL')
  }

  async analyzeIdea(param: {
    problem: string
    motivation: string
    features: string
    method: string
    deliverable: string
  }) {
    const res = await fetch(`${this.baseUrl}/analyses/projects/overview`, {
      method: 'POST',
      body: JSON.stringify(param),
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        is_success: false as const,
        status: res.status,
        code: data.code,
      }
    }

    const dto = plainToInstance(AnalyzeIdeaDto, data)
    await validateOrReject(dto)

    return {
      is_success: true as const,
      data: dto,
    }
  }

  watchAnalysisStatus(param: { task_id: string }): Observable<any> {
    return new Observable((observer) => {
      const eventSource = new EventSource(
        `${this.baseUrl}/analyses/projects/status?task_id=${param.task_id}`,
      )

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const dto = plainToInstance(WatchAnalysisStatusDto, data)

          observer.next({
            is_success: true,
            data: dto,
          })

          if (data.status === 'completed' || data.status === 'failed') {
            eventSource.close()
            observer.complete()
          }
        } catch (error) {
          observer.error(error)
        }
      }

      eventSource.onerror = (err) => {
        eventSource.close()

        observer.error({
          is_success: false,
          status: 500,
          code: 'SSE_CONNECTION_ERROR',
        })
      }

      return () => {
        eventSource.close()
      }
    })
  }
}
