import { IsString } from 'class-validator'

export class AnalyzeIdeaUsecaseDto {
  @IsString()
  problem!: string

  @IsString()
  solution!: string
}
