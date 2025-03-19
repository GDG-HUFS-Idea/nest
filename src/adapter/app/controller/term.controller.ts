import { Controller, Get, Inject, Query } from '@nestjs/common'
import {
  GET_TERMS_USECASE,
  GetTermsUsecasePort,
} from 'src/port/in/term/getTerms.usecase.port'
import { GetTermsUsecaseDto } from '../dto/term/getTerms.usecase.dto'

@Controller('/terms')
export class TermController {
  constructor(
    @Inject(GET_TERMS_USECASE)
    private readonly getTermsUsecase: GetTermsUsecasePort,
  ) {}

  @Get('/')
  async getTerms(@Query() dto: GetTermsUsecaseDto) {
    const result = this.getTermsUsecase.exec(dto)

    return result
  }
}
