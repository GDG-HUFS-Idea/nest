import { Test, TestingModule } from '@nestjs/testing'
import { UserAgreement } from 'src/domain/userAgreement'
import { UserAgreementRepo } from 'src/adapter/pg/repo/userAgreement.repo'
import { PgService } from 'src/adapter/pg/pg.service'
import { userSeeds } from 'src/adapter/pg/seed/userSeeds'
import { ConfigModule } from '@nestjs/config'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { termSeeds } from 'src/adapter/pg/seed/termSeeds'

describe('UserAgreementRepo', () => {
  let userAgreementRepo: UserAgreementRepo
  let pgService: PgService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [UserAgreementRepo, PgService],
    }).compile()

    userAgreementRepo = module.get<UserAgreementRepo>(UserAgreementRepo)
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

  describe('saveMany', () => {
    it(
      '여러 동의 내역 한번에 저장',
      wrapper(async (trxCtx: RdbClient) => {
        const targetUser = userSeeds[1]
        const targetTerms = [termSeeds[0], termSeeds[1]]
        const newUserAgreements = [
          new UserAgreement({
            userId: targetUser.id!,
            termId: targetTerms[0].id!,
            hasAgreed: true,
          }),
          new UserAgreement({
            userId: targetUser.id!,
            termId: targetTerms[1].id!,
            hasAgreed: false,
          }),
        ]

        const savedAgreements = await userAgreementRepo.saveMany({
          userAgreements: newUserAgreements,
          ctx: trxCtx,
        })

        expect(savedAgreements).not.toBeNull()
        expect(savedAgreements!.length).toBe(newUserAgreements.length)

        for (let i = 0; i < newUserAgreements.length; i++) {
          const newAgreement = newUserAgreements[i]
          const savedAgreement = savedAgreements!.find(
            (a) =>
              a.userId === newAgreement.userId &&
              a.termId === newAgreement.termId,
          )

          expect(savedAgreement).toBeDefined()
          expect(savedAgreement!.id).toBeDefined()
          expect(savedAgreement!.userId).toBe(newAgreement.userId)
          expect(savedAgreement!.termId).toBe(newAgreement.termId)
          expect(savedAgreement!.hasAgreed).toBe(newAgreement.hasAgreed)
        }
      }),
    )

    it(
      '빈 배열로 저장 시도시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const emptyAgreements: UserAgreement[] = []

        const savedAgreements = await userAgreementRepo.saveMany({
          userAgreements: emptyAgreements,
          ctx: trxCtx,
        })

        expect(savedAgreements).toBeNull()
      }),
    )
  })
})
