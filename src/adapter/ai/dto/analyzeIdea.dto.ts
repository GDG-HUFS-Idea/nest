import { IsString } from 'class-validator'

export class AnalyzeIdeaDto {
  @IsString()
  task_id!: string
}
