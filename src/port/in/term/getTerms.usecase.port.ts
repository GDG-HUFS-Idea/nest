import { GetTermsUsecaseDto } from 'src/adapter/app/dto/term/getTerms.usecase.dto'
import { TermType } from 'src/shared/enum/enum'

export const GET_TERMS_USECASE = Symbol('GET_TERMS_USECASE')

export interface GetTermsUsecasePort {
  exec(dto: GetTermsUsecaseDto): Promise<GetTermsUsecaseRes>
}

export type GetTermsUsecaseRes = {
  terms: {
    id: number
    type: TermType
    title: string
    content: string
    is_required: boolean
    written_at: Date
  }[]
  missing_term_ids?: number[]
}
