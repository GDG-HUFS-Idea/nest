import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { GetTermsUsecaseDto } from 'src/adapter/app/dto/term/getTerms.usecase.dto'
import { Term } from 'src/domain/term'
import {
  GetTermsUsecaseRes,
  GetTermsUsecasePort,
} from 'src/port/in/term/getTerms.usecase.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'

@Injectable()
export class GetTermsUsecase implements GetTermsUsecasePort {
  constructor(@Inject(TERM_REPO) private readonly termRepo: TermRepoPort) {}

  async exec(dto: GetTermsUsecaseDto): Promise<GetTermsUsecaseRes> {
    const terms = await this.retrieveTermsByIds(dto.ids)
    const missingIds = this.findMissingTermIds(dto.ids, terms)

    const formattedTerms = this.formatTermsForRes(terms)

    const res = { terms: formattedTerms }

    if (missingIds.length > 0) {
      res['missing_term_ids'] = missingIds
    }

    return res
  }

  // ID로 약관 정보 조회
  private async retrieveTermsByIds(ids: number[]) {
    const terms = await this.termRepo.findManyByIds({ ids }).catch(() => {
      throw new BadGatewayException()
    })

    if (!terms) throw new NotFoundException()

    return terms
  }

  // 약관 정보를 응답 형식으로 변환
  private formatTermsForRes(terms: Term[]) {
    return terms.map((term) => ({
      id: term.id!,
      type: term.type,
      title: term.title,
      content: term.content,
      is_required: term.isRequired,
      written_at: term.createdAt,
    }))
  }

  // 찾지 못한 약관 ID 목록 생성
  private findMissingTermIds(requestedIds: number[], foundTerms: Term[]) {
    const foundIds = foundTerms.map((term) => term.id!)
    return requestedIds.filter((id) => !foundIds.includes(id))
  }
}
