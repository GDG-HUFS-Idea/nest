import { Test, TestingModule } from '@nestjs/testing'
import { User } from 'src/domain/user'
import { UserRepo } from 'src/adapter/pg/repo/user.repo'
import { PgService } from 'src/adapter/pg/pg.service'
import { userSeeds } from 'src/adapter/pg/seed/userSeeds'
import { ConfigModule } from '@nestjs/config'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { UserPermission, UserPlan } from 'src/shared/enum/enum'

describe('UserRepo', () => {
  let userRepo: UserRepo
  let pgService: PgService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [UserRepo, PgService],
    }).compile()

    userRepo = module.get<UserRepo>(UserRepo)
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

  describe('findOneByEmail', () => {
    it(
      '이메일로 사용자 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = userSeeds[0]

        const foundUser = await userRepo.findOneByEmail({
          email: targetSeed.email,
          ctx: trxCtx,
        })

        expect(foundUser).not.toBeNull()
        expect(foundUser!.id).toBe(targetSeed.id)
        expect(foundUser!.email).toBe(targetSeed.email)
        expect(foundUser!.name).toBe(targetSeed.name)
        expect(foundUser!.plan).toBe(targetSeed.plan)
        expect(foundUser!.permissions).toEqual(targetSeed.permissions)
      }),
    )

    it(
      '존재하지 않은 이메일은 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const foundUser = await userRepo.findOneByEmail({
          email: 'nonexistent@example.com',
          ctx: trxCtx,
        })

        expect(foundUser).toBeNull()
      }),
    )
  })

  describe('saveOne', () => {
    it(
      '새 사용자 저장',
      wrapper(async (trxCtx: RdbClient) => {
        const newUser = new User({
          name: '테스트 사용자',
          plan: UserPlan.FREE,
          permissions: [UserPermission.GENERAL],
          email: 'test@example.com',
        })

        const savedUser = await userRepo.saveOne({
          user: newUser,
          ctx: trxCtx,
        })

        expect(savedUser).not.toBeNull()
        expect(savedUser.id).toBeDefined()
        expect(savedUser.email).toBe(newUser.email)
        expect(savedUser.name).toBe(newUser.name)
        expect(savedUser.plan).toBe(newUser.plan)
        expect(savedUser.permissions).toEqual(newUser.permissions)

        const foundUser = await userRepo.findOneByEmail({
          email: newUser.email,
          ctx: trxCtx,
        })

        expect(foundUser).not.toBeNull()
        expect(foundUser!.id).toBe(savedUser.id)
      }),
    )
  })
})
