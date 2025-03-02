import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  GetTermsUsecaseDto,
  GetTermsUsecaseRes,
  GetTermsUsecasePort,
} from 'src/port/in/term/getTerms.usecase.port'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'

@Injectable()
export class GetTermsUsecase implements GetTermsUsecasePort {
  constructor(@Inject(TERM_REPO) private readonly termRepo: TermRepoPort) {}

  async exec(dto: GetTermsUsecaseDto): Promise<GetTermsUsecaseRes> {
    // 1. 요청된 ID로 약관 정보 조회
    const terms = await this.termRepo.findManyByIds({ ids: dto.ids })
    if (!terms) throw new NotFoundException()

    // 2. 응답 데이터 구성
    const dtoOut: GetTermsUsecaseRes = {
      terms: terms.map((term) => ({
        id: term.id!,
        type: term.type,
        title: term.title,
        content: term.content,
        is_required: term.isRequired,
        writed_at: term.createdAt,
      })),
    }

    // 3. 찾지 못한 약관 ID가 있으면 응답에 포함
    const foundIds = terms.map((term) => term.id!)
    const missingIds = dto.ids.filter((id) => !foundIds.includes(id))
    if (missingIds.length > 0) {
      dtoOut.missing_term_ids = missingIds
    }

    return dtoOut
  }
}
