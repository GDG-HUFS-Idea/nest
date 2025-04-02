import { Transform } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class GetMyProjectListUsecaseDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  offset!: number

  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit!: number
}
