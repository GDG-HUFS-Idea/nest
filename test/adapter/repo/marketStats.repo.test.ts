import { Test, TestingModule } from '@nestjs/testing'
import { MarketStatsRepo } from 'src/adapter/pg/repo/marketStats.repo'
import { PgService } from 'src/adapter/pg/pg.service'
import { marketStatsSeeds } from 'src/adapter/pg/seed/marketStatsSeeds'
import { marketTrendSeeds } from 'src/adapter/pg/seed/marketTrendSeeds'
import { avgRevenueSeeds } from 'src/adapter/pg/seed/avgRevenueSeeds'
import { ConfigModule } from '@nestjs/config'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import { MarketStats } from 'src/domain/marketStats'
import { Currency, Region } from 'src/shared/enum/enum'
import * as schema from 'src/adapter/pg/drizzle/schema'
import { eq } from 'drizzle-orm'

describe('MarketStatsRepo', () => {
  let marketStatsRepo: MarketStatsRepo
  let pgService: PgService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [MarketStatsRepo, PgService],
    }).compile()

    marketStatsRepo = module.get<MarketStatsRepo>(MarketStatsRepo)
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

  describe('findOneByIndustryPath', () => {
    it(
      '산업 경로로 시장 통계 조회',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = marketStatsSeeds[0]
        const currentYear = new Date().getFullYear()
        // 5년 데이터 조회 (2021-2025년 데이터, 현재 연도가 2025년이라 가정)
        const fromYear = currentYear - 5 + 1 // 2021
        const toYear = currentYear // 2025

        const foundStats = await marketStatsRepo.findOneByIndustryPath({
          industryPath: targetSeed.industryPath,
          fromYear,
          toYear,
          ctx: trxCtx,
        })

        expect(foundStats).not.toBeNull()
        expect(foundStats!.id).toBe(targetSeed.id)
        expect(foundStats!.industryPath).toBe(targetSeed.industryPath)
        expect(foundStats!.score).toBe(targetSeed.score)

        // 국내 시장 트렌드 확인 (헬스케어 시장은 5개 트렌드 데이터)
        const domesticTrends = marketTrendSeeds.filter(
          (trend) =>
            trend.marketStatsId === targetSeed.id &&
            trend.region === Region.DOMESTIC &&
            trend.year >= fromYear &&
            trend.year <= toYear,
        )
        expect(foundStats!.domesticMarketTrends.length).toBe(
          domesticTrends.length,
        )

        // 글로벌 시장 트렌드 확인
        const globalTrends = marketTrendSeeds.filter(
          (trend) =>
            trend.marketStatsId === targetSeed.id &&
            trend.region === Region.GLOBAL &&
            trend.year >= fromYear &&
            trend.year <= toYear,
        )
        expect(foundStats!.globalMarketTrends.length).toBe(globalTrends.length)

        // 평균 매출 확인
        const domesticRevenue = avgRevenueSeeds.find(
          (rev) =>
            rev.marketStatsId === targetSeed.id &&
            rev.region === Region.DOMESTIC,
        )
        const globalRevenue = avgRevenueSeeds.find(
          (rev) =>
            rev.marketStatsId === targetSeed.id && rev.region === Region.GLOBAL,
        )

        expect(foundStats!.domesticAvgRevenue.amount).toBe(
          domesticRevenue!.amount,
        )
        expect(foundStats!.domesticAvgRevenue.currency).toBe(
          domesticRevenue!.currency,
        )
        expect(foundStats!.globalAvgRevenue.amount).toBe(globalRevenue!.amount)
        expect(foundStats!.globalAvgRevenue.currency).toBe(
          globalRevenue!.currency,
        )
      }),
    )

    it(
      '존재하지 않는 산업 경로로 조회시 null 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const nonExistentPath = '존재하지않는>산업>경로'
        const currentYear = new Date().getFullYear()
        const fromYear = currentYear - 5
        const toYear = currentYear

        const foundStats = await marketStatsRepo.findOneByIndustryPath({
          industryPath: nonExistentPath,
          fromYear,
          toYear,
          ctx: trxCtx,
        })

        expect(foundStats).toBeNull()
      }),
    )

    it(
      '연도 범위 외의 데이터만 있을 경우 빈 트렌드 배열 반환',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = marketStatsSeeds[0]
        // 시드 데이터의 연도 범위 밖의 기간 (미래 연도)
        const fromYear = new Date().getFullYear() + 10
        const toYear = fromYear + 5

        const foundStats = await marketStatsRepo.findOneByIndustryPath({
          industryPath: targetSeed.industryPath,
          fromYear,
          toYear,
          ctx: trxCtx,
        })

        // 시장 통계 자체는 찾아야 함
        expect(foundStats).not.toBeNull()
        expect(foundStats!.id).toBe(targetSeed.id)

        // 하지만 해당 연도 범위의 트렌드 데이터는 없어야 함
        expect(foundStats!.domesticMarketTrends.length).toBe(0)
        expect(foundStats!.globalMarketTrends.length).toBe(0)
      }),
    )
  })

  describe('saveOne', () => {
    it(
      '새 시장 통계 저장',
      wrapper(async (trxCtx: RdbClient) => {
        const newMarketStats = new MarketStats({
          industryPath: '새로운>산업>경로',
          score: 75,
          domesticMarketTrends: [
            {
              year: 2020,
              volume: 1000000,
              currency: Currency.KRW,
              growthRate: 5.5,
              source: 'test source',
            },
            {
              year: 2021,
              volume: 1100000,
              currency: Currency.KRW,
              growthRate: 10.0,
              source: 'test source',
            },
          ],
          globalMarketTrends: [
            {
              year: 2020,
              volume: 10000,
              currency: Currency.USD,
              growthRate: 7.0,
              source: 'test source',
            },
            {
              year: 2021,
              volume: 11000,
              currency: Currency.USD,
              growthRate: 10.0,
              source: 'test source',
            },
          ],
          domesticAvgRevenue: {
            amount: 50000,
            currency: Currency.KRW,
            source: 'test source',
          },
          globalAvgRevenue: {
            amount: 5000,
            currency: Currency.USD,
            source: 'test source',
          },
        })

        const savedStats = await marketStatsRepo.saveOne({
          marketStats: newMarketStats,
          ctx: trxCtx,
        })

        expect(savedStats).not.toBeNull()
        expect(savedStats.id).toBeDefined()
        expect(savedStats.industryPath).toBe(newMarketStats.industryPath)
        expect(savedStats.score).toBe(newMarketStats.score)

        // 국내 시장 트렌드 확인
        expect(savedStats.domesticMarketTrends).toBeDefined()
        expect(savedStats.domesticMarketTrends.length).toBe(
          newMarketStats.domesticMarketTrends.length,
        )

        // 글로벌 시장 트렌드 확인
        expect(savedStats.globalMarketTrends).toBeDefined()
        expect(savedStats.globalMarketTrends.length).toBe(
          newMarketStats.globalMarketTrends.length,
        )

        // 평균 매출 확인
        expect(savedStats.domesticAvgRevenue).toBeDefined()
        expect(savedStats.domesticAvgRevenue.amount).toBe(
          newMarketStats.domesticAvgRevenue.amount,
        )
        expect(savedStats.globalAvgRevenue).toBeDefined()
        expect(savedStats.globalAvgRevenue.amount).toBe(
          newMarketStats.globalAvgRevenue.amount,
        )
      }),
    )

    it(
      '기존 시장 통계 업데이트',
      wrapper(async (trxCtx: RdbClient) => {
        const targetSeed = marketStatsSeeds[0]
        const updatedScore = 95
        const currentYear = new Date().getFullYear()
        const fromYear = currentYear - 5
        const toYear = currentYear

        // 기존 데이터 로드
        const existingStats = await marketStatsRepo.findOneByIndustryPath({
          industryPath: targetSeed.industryPath,
          fromYear,
          toYear,
          ctx: trxCtx,
        })

        expect(existingStats).not.toBeNull()

        // 데이터 수정
        const statsToUpdate = new MarketStats({
          id: existingStats!.id,
          industryPath: existingStats!.industryPath,
          score: updatedScore,
          domesticMarketTrends: [
            {
              year: 2022,
              volume: 1200000,
              currency: Currency.KRW,
              growthRate: 8.0,
              source: 'updated source',
            },
          ],
          globalMarketTrends: [
            {
              year: 2022,
              volume: 12000,
              currency: Currency.USD,
              growthRate: 9.0,
              source: 'updated source',
            },
          ],
          domesticAvgRevenue: {
            amount: 60000,
            currency: Currency.KRW,
            source: 'updated source',
          },
          globalAvgRevenue: {
            amount: 6000,
            currency: Currency.USD,
            source: 'updated source',
          },
        })

        const updatedStats = await marketStatsRepo.saveOne({
          marketStats: statsToUpdate,
          ctx: trxCtx,
        })

        expect(updatedStats).not.toBeNull()
        expect(updatedStats.id).toBe(existingStats!.id)
        expect(updatedStats.score).toBe(updatedScore)

        // 트렌드와 평균 매출이 업데이트되었는지 확인
        expect(updatedStats.domesticMarketTrends.length).toBe(
          statsToUpdate.domesticMarketTrends.length,
        )
        expect(updatedStats.globalMarketTrends.length).toBe(
          statsToUpdate.globalMarketTrends.length,
        )
        expect(updatedStats.domesticAvgRevenue.amount).toBe(
          statsToUpdate.domesticAvgRevenue.amount,
        )
        expect(updatedStats.globalAvgRevenue.amount).toBe(
          statsToUpdate.globalAvgRevenue.amount,
        )
      }),
    )
  })
})
