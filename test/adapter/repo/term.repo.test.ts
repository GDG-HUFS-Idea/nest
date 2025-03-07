import { Test, TestingModule } from '@nestjs/testing'
import { TermRepo } from 'src/adapter/pg/repo/term.repo'
import { PgService } from 'src/adapter/pg/pg.service'
import { termSeeds } from 'src/adapter/pg/seed/termSeeds'
import { ConfigModule } from '@nestjs/config'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { TermType } from 'src/shared/type/enum.type'

describe('TermRepo', () => {
  let termRepo: TermRepo
  let pgService: PgService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [TermRepo, PgService],
    }).compile()

    termRepo = module.get<TermRepo>(TermRepo)
    pgService = module.get<PgService>(PgService)
  })

  afterAll(async () => {
    await pgService.close()
  })

  const wrapper = (testFn) => {
    return () => {
      const ctx = pgService.getClient()
      return ctx
        .transaction(async (trxCtx: RdbClient) => {
          await testFn(trxCtx)
          throw new Error('__TEST_ROLLBACK__')
        })
        .catch((err) => {
          if (err.message !== '__TEST_ROLLBACK__') throw err
        })
    }
  }

  describe('findManyByIds', () => {
    it(
      'ID 목록으로 여러 약관 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeeds = [termSeeds[0], termSeeds[1]]
        const targetIds = targetSeeds.map((seed) => seed.id!)

        const foundTerms = await termRepo.findManyByIds({
          ids: targetIds,
          ctx: trxCtx,
        })

        expect(foundTerms).not.toBeNull()
        expect(foundTerms!.length).toBe(targetIds.length)

        for (const seed of targetSeeds) {
          const foundTerm = foundTerms!.find((t) => t.id === seed.id)

          expect(foundTerm).toBeDefined()
          expect(foundTerm!.id).toBe(seed.id)
          expect(foundTerm!.type).toBe(seed.type)
          expect(foundTerm!.title).toBe(seed.title)
          expect(foundTerm!.content).toBe(seed.content)
          expect(foundTerm!.isRequired).toBe(seed.isRequired)
        }
      }),
    )

    it(
      '존재하지 않는 ID로 조회시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const nonExistentIds = [999, 1000]

        const foundTerms = await termRepo.findManyByIds({
          ids: nonExistentIds,
          ctx: trxCtx,
        })

        expect(foundTerms).toBeNull()
      }),
    )
  })

  describe('findLatestByTypes', () => {
    it(
      '타입별 최신 약관 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const termsOfServiceType: TermType = 'terms_of_service'
        const privacyPolicyType: TermType = 'privacy_policy'
        const marketingType: TermType = 'marketing'
        const types: TermType[] = [
          termsOfServiceType,
          privacyPolicyType,
          marketingType,
        ]

        const foundTerms = await termRepo.findLatestByTypes({
          types: types,
          ctx: trxCtx,
        })

        expect(foundTerms).not.toBeNull()
        expect(foundTerms!.length).toBe(3)

        const termsOfServiceTerms = termSeeds.filter(
          (s) => s.type === termsOfServiceType,
        )
        const latestTermsOfService = termsOfServiceTerms.reduce(
          (prev, current) => (prev.id! > current.id! ? prev : current),
        )

        const privacyPolicyTerms = termSeeds.filter(
          (s) => s.type === privacyPolicyType,
        )
        const latestPrivacyPolicy = privacyPolicyTerms.reduce(
          (prev, current) => (prev.id! > current.id! ? prev : current),
        )

        const marketingTerms = foundTerms!.filter(
          (s) => s.type === marketingType,
        )
        const latestMarketing = marketingTerms!.reduce((prev, current) =>
          prev.id! > current.id! ? prev : current,
        )

        const foundTermsOfService = foundTerms!.find(
          (t) => t.type === termsOfServiceType,
        )
        const foundPrivacyPolicy = foundTerms!.find(
          (t) => t.type === privacyPolicyType,
        )
        const foundMarketing = foundTerms!.find((t) => t.type === marketingType)

        expect(foundTermsOfService).toBeDefined()
        expect(foundTermsOfService!.id).toBe(latestTermsOfService.id)

        expect(foundPrivacyPolicy).toBeDefined()
        expect(foundPrivacyPolicy!.id).toBe(latestPrivacyPolicy.id)

        expect(foundMarketing).toBeDefined()
        expect(foundMarketing!.id).toBe(latestMarketing.id)
      }),
    )

    it(
      '존재하지 않는 타입으로 조회시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const nonExistentTypes: TermType[] = ['non_existent_type' as TermType]

        const foundTerms = await termRepo.findLatestByTypes({
          types: nonExistentTypes,
          ctx: trxCtx,
        })

        expect(foundTerms).toBeNull()
      }),
    )
  })
})
