import { BadGatewayException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { GetTermsUsecaseDto } from 'src/adapter/app/dto/term/getTerms.usecase.dto'
import { Term } from 'src/domain/term'
import { GetTermsUsecaseRes, GetTermsUsecasePort } from 'src/port/in/term/getTerms.usecase.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'

@Injectable()
export class GetTermsUsecase implements GetTermsUsecasePort {
  constructor(@Inject(TERM_REPO) private readonly termRepo: TermRepoPort) {}

  async exec(dto: GetTermsUsecaseDto): Promise<GetTermsUsecaseRes> {
    const terms = await this.getTerms(dto)

    const missingIds = dto.ids.filter((id) => !terms.some((term) => term.id === id))

    return this.buildRes(terms, missingIds)
  }

  private buildRes(terms: Term[], missingIds: number[]): GetTermsUsecaseRes | PromiseLike<GetTermsUsecaseRes> {
    return {
      terms: terms.map((term) => ({
        id: term.id!,
        type: term.type,
        title: term.title,
        content: term.content,
        is_required: term.isRequired,
        written_at: term.createdAt,
      })),
      ...(missingIds.length > 0 && { missing_term_ids: missingIds }),
    }
  }

  private async getTerms(dto: GetTermsUsecaseDto) {
    const terms = await this.termRepo.findManyByIds({ ids: dto.ids }).catch(() => {
      throw new BadGatewayException()
    })
    if (!terms) throw new NotFoundException()

    return terms
  }
}
