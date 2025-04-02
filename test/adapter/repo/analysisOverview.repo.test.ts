import { Test, TestingModule } from '@nestjs/testing'
import { AnalysisOverviewRepo } from 'src/adapter/pg/repo/analysisOverview.repo'
import { PgService } from 'src/adapter/pg/pg.service'
import { analysisOverviewSeeds } from 'src/adapter/pg/seed/analysisSeeds'
import { ConfigModule } from '@nestjs/config'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { AnalysisOverview } from 'src/domain/analysisOverview'
import * as schema from 'src/adapter/pg/drizzle/schema'
import { Currency } from 'src/shared/enum/enum'
import { eq } from 'drizzle-orm'

describe('AnalysisOverviewRepo', () => {
  let analysisOverviewRepo: AnalysisOverviewRepo
  let pgService: PgService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [AnalysisOverviewRepo, PgService],
    }).compile()

    analysisOverviewRepo =
      module.get<AnalysisOverviewRepo>(AnalysisOverviewRepo)
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
      '새 분석 개요 저장',
      wrapper(async (trxCtx: RdbClient) => {
        const projectId = 1
        const newAnalysisOverview = new AnalysisOverview({
          projectId,
          summary: '테스트 요약',
          industryPath: '테스트>산업>경로',
          review: '테스트 리뷰',
          similarServicesScore: 80,
          limitationsScore: 70,
          opportunitiesScore: 90,
          similarServices: [
            {
              description: 'Test service',
              logoUrl: 'http://example.com/logo.png',
              websiteUrl: 'http://example.com',
              tags: ['tag1', 'tag2'],
              summary: 'Service summary',
            },
          ],
          supportPrograms: [
            {
              name: 'Test Program',
              organizer: 'Test Organizer',
              url: 'http://example.com',
              startDate: new Date('2023-01-01'),
              endDate: new Date('2023-12-31'),
            },
          ],
          targetMarkets: [
            {
              target: 'Test market',
              iconUrl: 'http://example.com/icon.png',
              order: 1,
              reasons: ['reason1', 'reason2'],
              appeal: ['appeal1', 'appeal2'],
              onlineActivity: ['activity1', 'activity2'],
              onlineChannels: ['channel1', 'channel2'],
              offlineChannels: ['offline1', 'offline2'],
            },
          ],
          marketingStrategies: [
            {
              title: 'Test Strategy',
              details: [
                {
                  label: 'Strategy Label',
                  description: 'Strategy Description',
                },
              ],
            },
          ],
          businessModel: {
            summary: 'Test business model',
            valueProp: {
              content: 'Test value proposition',
              details: [
                {
                  label: 'Value Prop Label',
                  description: 'Value Prop Description',
                },
              ],
            },
            revenue: [
              {
                label: 'Revenue Label',
                description: 'Revenue Description',
                details: ['detail1', 'detail2'],
              },
            ],
            investments: [
              {
                order: 1,
                section: 'Investment Section',
                details: [
                  {
                    label: 'Investment Label',
                    description: 'Investment Description',
                  },
                ],
              },
            ],
          },
          opportunities: [
            {
              title: 'Opportunity Title',
              description: 'Opportunity Description',
            },
          ],
          limitations: [
            {
              category: 'Limitation Category',
              detail: 'Limitation Detail',
              impact: 'Limitation Impact',
              solution: 'Limitation Solution',
            },
          ],
          teamRequirements: [
            {
              order: 1,
              role: 'Team Role',
              skills: ['skill1', 'skill2'],
              tasks: ['task1', 'task2'],
              salaryMin: 50000,
              salaryMax: 80000,
              currency: Currency.KRW,
            },
          ],
        })

        const savedAnalysis = await analysisOverviewRepo.saveOne({
          analysisOverview: newAnalysisOverview,
          ctx: trxCtx,
        })

        expect(savedAnalysis).not.toBeNull()
        expect(savedAnalysis.id).toBeDefined()
        expect(savedAnalysis.projectId).toBe(projectId)
        expect(savedAnalysis.summary).toBe(newAnalysisOverview.summary)
        expect(savedAnalysis.industryPath).toBe(
          newAnalysisOverview.industryPath,
        )
        expect(savedAnalysis.review).toBe(newAnalysisOverview.review)
        expect(savedAnalysis.similarServicesScore).toBe(
          newAnalysisOverview.similarServicesScore,
        )
        expect(savedAnalysis.limitationsScore).toBe(
          newAnalysisOverview.limitationsScore,
        )
        expect(savedAnalysis.opportunitiesScore).toBe(
          newAnalysisOverview.opportunitiesScore,
        )

        // 복잡한 객체 검증
        expect(savedAnalysis.similarServices).toHaveLength(
          newAnalysisOverview.similarServices.length,
        )
        expect(savedAnalysis.supportPrograms).toHaveLength(
          newAnalysisOverview.supportPrograms.length,
        )
        expect(savedAnalysis.targetMarkets).toHaveLength(
          newAnalysisOverview.targetMarkets.length,
        )
        expect(savedAnalysis.marketingStrategies).toHaveLength(
          newAnalysisOverview.marketingStrategies.length,
        )
        expect(savedAnalysis.opportunities).toHaveLength(
          newAnalysisOverview.opportunities.length,
        )
        expect(savedAnalysis.limitations).toHaveLength(
          newAnalysisOverview.limitations.length,
        )
        expect(savedAnalysis.teamRequirements).toHaveLength(
          newAnalysisOverview.teamRequirements.length,
        )
      }),
    )

    it(
      '기존 분석 개요 업데이트',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = analysisOverviewSeeds[0]
        const updatedSummary = '업데이트된 AI 건강관리 플랫폼'
        const updatedReview = '업데이트된 리뷰 내용'

        const analysisToUpdate = new AnalysisOverview({
          id: targetSeed.id,
          projectId: targetSeed.projectId,
          summary: updatedSummary,
          industryPath: targetSeed.industryPath,
          review: updatedReview,
          similarServicesScore: targetSeed.similarServicesScore,
          limitationsScore: targetSeed.limitationsScore,
          opportunitiesScore: targetSeed.opportunitiesScore,
          similarServices: targetSeed.similarServices!,
          supportPrograms: targetSeed.supportPrograms!,
          targetMarkets: targetSeed.targetMarkets!,
          marketingStrategies: targetSeed.marketingStrategies!,
          businessModel: targetSeed.businessModel,
          opportunities: targetSeed.opportunities!,
          limitations: targetSeed.limitations!,
          teamRequirements: targetSeed.teamRequirements!,
        })

        const updatedAnalysis = await analysisOverviewRepo.saveOne({
          analysisOverview: analysisToUpdate,
          ctx: trxCtx,
        })

        expect(updatedAnalysis).not.toBeNull()
        expect(updatedAnalysis.id).toBe(targetSeed.id)
        expect(updatedAnalysis.projectId).toBe(targetSeed.projectId)
        expect(updatedAnalysis.summary).toBe(updatedSummary)
        expect(updatedAnalysis.review).toBe(updatedReview)
        expect(updatedAnalysis.similarServicesScore).toBe(
          targetSeed.similarServicesScore,
        )
      }),
    )
  })

  describe('findOneByIdJoinProject', () => {
    it(
      'ID로 분석 개요와 프로젝트 함께 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = analysisOverviewSeeds[0]

        const foundAnalysis = await analysisOverviewRepo.findOneByIdJoinProject(
          {
            id: targetSeed.id!,
            ctx: trxCtx,
          },
        )

        expect(foundAnalysis).not.toBeNull()
        expect(foundAnalysis!.id).toBe(targetSeed.id)
        expect(foundAnalysis!.projectId).toBe(targetSeed.projectId)
        expect(foundAnalysis!.summary).toBe(targetSeed.summary)
        expect(foundAnalysis!.industryPath).toBe(targetSeed.industryPath)
        expect(foundAnalysis!.project).toBeDefined()
        expect(foundAnalysis!.project!.id).toBe(targetSeed.projectId)
        expect(foundAnalysis!.project!.name).toBe('AI 기반 건강관리 플랫폼')
      }),
    )

    it(
      '존재하지 않는 ID로 조회시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const nonExistentId = 9999

        const foundAnalysis = await analysisOverviewRepo.findOneByIdJoinProject(
          {
            id: nonExistentId,
            ctx: trxCtx,
          },
        )

        expect(foundAnalysis).toBeNull()
      }),
    )

    it(
      '연결된 프로젝트가 삭제된 경우 프로젝트 정보 없이 분석 개요만 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = analysisOverviewSeeds[0]

        // 프로젝트를 소프트 삭제
        await trxCtx
          .update(schema.projects)
          .set({ deletedAt: new Date() })
          .where(eq(schema.projects.id, targetSeed.projectId))
          .execute()

        const foundAnalysis = await analysisOverviewRepo.findOneByIdJoinProject(
          {
            id: targetSeed.id!,
            ctx: trxCtx,
          },
        )

        expect(foundAnalysis).not.toBeNull()
        expect(foundAnalysis!.id).toBe(targetSeed.id)
        expect(foundAnalysis!.projectId).toBe(targetSeed.projectId)
        // 프로젝트가 삭제되었으므로 연결된 프로젝트 정보는 없어야 함
        expect(foundAnalysis!.project).toBeUndefined()
      }),
    )
  })
})
