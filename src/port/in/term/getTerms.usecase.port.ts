import { Transform } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator'
import { TermType } from 'src/shared/type/enum.type'

export const GET_TERMS_USECASE = Symbol('GET_TERMS_USECASE')

export interface GetTermsUsecasePort {
  exec(dto: GetTermsUsecaseDto): Promise<GetTermsUsecaseRes>
}

export class GetTermsUsecaseDto {
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) => Number(item))
    }
    return value
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ids!: number[]
}

export type GetTermsUsecaseRes = {
  terms: {
    id: number
    type: TermType
    title: string
    content: string
    is_required: boolean
    writed_at: Date
  }[]
  missing_term_ids?: number[]
}
