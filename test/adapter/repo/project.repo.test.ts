import { Test, TestingModule } from '@nestjs/testing'
import { ProjectRepo } from 'src/adapter/pg/repo/project.repo'
import { PgService } from 'src/adapter/pg/pg.service'
import { projectSeeds } from 'src/adapter/pg/seed/projectSeeds'
import { ConfigModule } from '@nestjs/config'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { Project } from 'src/domain/project'

describe('ProjectRepo', () => {
  let projectRepo: ProjectRepo
  let pgService: PgService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [ProjectRepo, PgService],
    }).compile()

    projectRepo = module.get<ProjectRepo>(ProjectRepo)
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

  describe('saveOne', () => {
    it(
      '새 프로젝트 저장',
      wrapper(async (trxCtx: RdbClient) => {
        const newProject = new Project({
          userId: 3,
          name: '테스트 프로젝트',
          industryPath: '헬스케어>디지털 헬스>새로운 카테고리',
        })

        const savedProject = await projectRepo.saveOne({
          project: newProject,
          ctx: trxCtx,
        })

        expect(savedProject).not.toBeNull()
        expect(savedProject!.id).toBeDefined()
        expect(savedProject!.userId).toBe(newProject.userId)
        expect(savedProject!.name).toBe(newProject.name)
        expect(savedProject!.industryPath).toBe(newProject.industryPath)
      }),
    )

    it(
      '기존 프로젝트 업데이트',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = projectSeeds[0]
        const updatedName = '업데이트된 AI 건강관리 플랫폼'
        const updatedIndustryPath =
          '헬스케어>디지털 헬스>건강관리 서비스>업데이트 솔루션'

        const projectToUpdate = new Project({
          id: targetSeed.id,
          userId: targetSeed.userId,
          name: updatedName,
          industryPath: updatedIndustryPath,
        })

        const updatedProject = await projectRepo.saveOne({
          project: projectToUpdate,
          ctx: trxCtx,
        })

        expect(updatedProject).not.toBeNull()
        expect(updatedProject!.id).toBe(targetSeed.id)
        expect(updatedProject!.userId).toBe(targetSeed.userId)
        expect(updatedProject!.name).toBe(updatedName)
        expect(updatedProject!.industryPath).toBe(updatedIndustryPath)
      }),
    )
  })

  describe('findOneById', () => {
    it(
      'ID로 프로젝트 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = projectSeeds[0]

        const foundProject = await projectRepo.findOneById({
          id: targetSeed.id!,
          ctx: trxCtx,
        })

        expect(foundProject).not.toBeNull()
        expect(foundProject!.id).toBe(targetSeed.id)
        expect(foundProject!.userId).toBe(targetSeed.userId)
        expect(foundProject!.name).toBe(targetSeed.name)
        expect(foundProject!.industryPath).toBe(targetSeed.industryPath)
      }),
    )

    it(
      '존재하지 않는 ID로 조회시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const nonExistentId = 9999

        const foundProject = await projectRepo.findOneById({
          id: nonExistentId,
          ctx: trxCtx,
        })

        expect(foundProject).toBeNull()
      }),
    )
  })

  describe('findOneByIdJoinAnalysisOverview', () => {
    it(
      'ID로 프로젝트와 분석 개요 함께 조회',
      wrapper(async (trxCtx: RdbClient) => {
        // 분석 개요가 있는 프로젝트
        const targetSeed = projectSeeds[0]

        const foundProject = await projectRepo.findOneByIdJoinAnalysisOverview({
          id: targetSeed.id!,
          ctx: trxCtx,
        })

        expect(foundProject).not.toBeNull()
        expect(foundProject!.id).toBe(targetSeed.id)
        expect(foundProject!.userId).toBe(targetSeed.userId)
        expect(foundProject!.name).toBe(targetSeed.name)
        expect(foundProject!.industryPath).toBe(targetSeed.industryPath)
        expect(foundProject!.analysisOverview).toBeDefined()
        expect(foundProject!.analysisOverview!.projectId).toBe(targetSeed.id)
        expect(foundProject!.analysisOverview!.summary).toBe(
          '사용자 맞춤형 AI 기반 건강관리 플랫폼',
        )
      }),
    )

    it(
      '존재하지 않는 ID로 조회시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const nonExistentId = 9999

        const foundProject = await projectRepo.findOneByIdJoinAnalysisOverview({
          id: nonExistentId,
          ctx: trxCtx,
        })

        expect(foundProject).toBeNull()
      }),
    )
  })

  describe('findManyByUserId', () => {
    it(
      '사용자 ID로 프로젝트 목록 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const userId = 3 // 시드 데이터의 사용자 ID
        const userProjects = projectSeeds.filter((p) => p.userId === userId)

        const foundProjects = await projectRepo.findManyByUserId({
          userId,
          offset: 0,
          limit: 10,
          ctx: trxCtx,
        })

        expect(foundProjects).not.toBeNull()
        expect(foundProjects!.length).toBeGreaterThanOrEqual(
          userProjects.length,
        )

        // 기존 프로젝트 데이터가 모두 포함되어 있는지 확인
        for (const seed of userProjects) {
          const found = foundProjects!.some((p) => p.id === seed.id)
          expect(found).toBeTruthy()
        }
      }),
    )

    it(
      '페이지네이션 적용하여 사용자 프로젝트 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const userId = 3

        const firstPage = await projectRepo.findManyByUserId({
          userId,
          offset: 0,
          limit: 1,
          ctx: trxCtx,
        })

        const secondPage = await projectRepo.findManyByUserId({
          userId,
          offset: 1,
          limit: 1,
          ctx: trxCtx,
        })

        expect(firstPage).not.toBeNull()
        expect(firstPage!.length).toBe(1)

        if (secondPage) {
          expect(secondPage.length).toBe(1)
          // 첫 페이지와 두 번째 페이지의 ID가 다른지 확인
          expect(firstPage![0].id).not.toBe(secondPage[0].id)
        }
      }),
    )

    it(
      '존재하지 않는 사용자 ID로 조회시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const nonExistentUserId = 9999

        const foundProjects = await projectRepo.findManyByUserId({
          userId: nonExistentUserId,
          offset: 0,
          limit: 10,
          ctx: trxCtx,
        })

        expect(foundProjects).toBeNull()
      }),
    )
  })
})
