import { IsString } from 'class-validator'

export class AnalyzeIdeaUsecaseDto {
  @IsString()
  problem!: string

  @IsString()
  motivation!: string

  @IsString()
  features!: string

  @IsString()
  method!: string

  @IsString()
  deliverable!: string
}
