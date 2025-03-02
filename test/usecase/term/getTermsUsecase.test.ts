import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { TERM_REPO, TermRepoPort } from 'src/port/out/repo/term.repo.port'
import { Term } from 'src/domain/term'
import { GetTermsUsecaseDto } from 'src/port/in/term/getTerms.usecase.port'
import { GetTermsUsecase } from 'src/usecase/term/getTerms.usecase'

describe('GetTermsUsecase', () => {
  let usecase: GetTermsUsecase
  let termRepo: TermRepoPort

  beforeEach(async () => {
    const mockTermRepo: TermRepoPort = {
      findManyByIds: jest.fn(),
      findOneById: jest.fn(),
      findLatestByTypes: jest.fn(),
      saveOne: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTermsUsecase,
        {
          provide: TERM_REPO,
          useValue: mockTermRepo,
        },
      ],
    }).compile()

    usecase = module.get<GetTermsUsecase>(GetTermsUsecase)
    termRepo = module.get<TermRepoPort>(TERM_REPO)
  })

  it('모든 약관 ID가 유효할 때 약관 정보 반환', async () => {
    const dto: GetTermsUsecaseDto = { ids: [1, 2] }

    const mockTerms = [
      new Term({
        id: 1,
        type: 'terms_of_service',
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
        createdAt: new Date('2023-01-01'),
      }),
      new Term({
        id: 2,
        type: 'privacy_policy',
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
        createdAt: new Date('2023-01-02'),
      }),
    ]

    jest.spyOn(termRepo, 'findManyByIds').mockResolvedValue(mockTerms)

    const result = await usecase.exec(dto)

    expect(termRepo.findManyByIds).toHaveBeenCalledWith({ ids: dto.ids })
    expect(result.terms.length).toBe(2)
    expect(result.terms[0].id).toBe(1)
    expect(result.terms[0].type).toBe('terms_of_service')
    expect(result.terms[0].title).toBe('서비스 이용약관')
    expect(result.terms[0].content).toBe('약관 내용')
    expect(result.terms[0].is_required).toBe(true)
    expect(result.terms[0].writed_at).toEqual(new Date('2023-01-01'))

    expect(result.terms[1].id).toBe(2)
    expect(result.terms[1].type).toBe('privacy_policy')
    expect(result.missing_term_ids).toBeUndefined()
  })

  it('일부 약관 ID가 없을 때 찾은 약관과 누락된 ID 목록 반환', async () => {
    const dto: GetTermsUsecaseDto = { ids: [1, 2, 3] }

    const mockTerms = [
      new Term({
        id: 1,
        type: 'terms_of_service',
        title: '서비스 이용약관',
        content: '약관 내용',
        isRequired: true,
        createdAt: new Date('2023-01-01'),
      }),
      new Term({
        id: 2,
        type: 'privacy_policy',
        title: '개인정보 처리방침',
        content: '방침 내용',
        isRequired: true,
        createdAt: new Date('2023-01-02'),
      }),
    ]

    jest.spyOn(termRepo, 'findManyByIds').mockResolvedValue(mockTerms)

    const result = await usecase.exec(dto)

    expect(termRepo.findManyByIds).toHaveBeenCalledWith({ ids: dto.ids })
    expect(result.terms.length).toBe(2)
    expect(result.missing_term_ids).toBeDefined()
    expect(result.missing_term_ids).toEqual([3])
  })

  it('모든 약관 ID가 없을 때 NotFound 발생', async () => {
    const dto: GetTermsUsecaseDto = { ids: [1, 2] }

    jest.spyOn(termRepo, 'findManyByIds').mockResolvedValue(null)

    await expect(usecase.exec(dto)).rejects.toThrow(NotFoundException)
    expect(termRepo.findManyByIds).toHaveBeenCalledWith({ ids: dto.ids })
  })
})
