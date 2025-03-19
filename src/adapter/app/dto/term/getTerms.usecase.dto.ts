import { Transform } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator'

export class GetTermsUsecaseDto {
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map((item) => Number(item))
    else return [Number(value)]
  })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  ids!: number[]
}
