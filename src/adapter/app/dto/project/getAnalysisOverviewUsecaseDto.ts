import { Transform } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class GetAnalysisOverviewUsecaseDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  id!: number
}
