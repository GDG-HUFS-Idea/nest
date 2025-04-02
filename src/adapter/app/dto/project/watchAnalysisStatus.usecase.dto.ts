import { IsString } from 'class-validator'

export class WatchAnalysisStatusUsecaseDto {
  @IsString()
  task_id!: string
}
