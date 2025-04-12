import { Currency } from 'src/shared/enum/enum'
import { z } from 'zod'

const parsePercentage = (value: string): number => parseFloat(value.replace('%', '')) / 100
const parseMoney = (value: string) => {
  let currency: Currency
  if (value.startsWith('$')) currency = Currency.USD
  else if (value.startsWith('₩')) currency = Currency.KRW

  const volume = parseFloat(value.replace(/[$₩,]/g, ''))
  return { volume, currency: currency! }
}
const parseMarketSize = (
  value: ({ year: number; size: { volume: number; currency: Currency }; growthRate: number } | { source: string })[],
): {
  items: { year: number; size: { volume: number; currency: Currency }; growthRate: number }[]
  source: { source: string }
} => {
  if (Array.isArray(value)) {
    const items = value.slice(0, -1) as {
      year: number
      size: { volume: number; currency: Currency }
      growthRate: number
    }[]
    const source = value[value.length - 1] as { source: string }
    return { items, source }
  }
  return { items: [], source: { source: '' } }
}

const parsePeriod = (value: string) => {
  const originalPeriod = value
  const untilPattern = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일까지/
  const fromToPattern = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일부터\s*(\d{1,2})월\s*(\d{1,2})일까지/
  const fromToYearPattern = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일부터\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일까지/
  const tildePattern = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*~\s*(\d{1,2})월\s*(\d{1,2})일/
  const tildeYearPattern = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*~\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/

  let startDate: Date | null = null
  let endDate: Date | null = null

  const untilMatch = originalPeriod.match(untilPattern)
  if (untilMatch) {
    const [_, year, month, day] = untilMatch
    endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  const fromToMatch = originalPeriod.match(fromToPattern)
  if (fromToMatch) {
    const [_, year, monthFrom, dayFrom, monthTo, dayTo] = fromToMatch
    startDate = new Date(parseInt(year), parseInt(monthFrom) - 1, parseInt(dayFrom))
    endDate = new Date(parseInt(year), parseInt(monthTo) - 1, parseInt(dayTo))
  }

  const fromToYearMatch = originalPeriod.match(fromToYearPattern)
  if (fromToYearMatch) {
    const [_, yearFrom, monthFrom, dayFrom, yearTo, monthTo, dayTo] = fromToYearMatch
    startDate = new Date(parseInt(yearFrom), parseInt(monthFrom) - 1, parseInt(dayFrom))
    endDate = new Date(parseInt(yearTo), parseInt(monthTo) - 1, parseInt(dayTo))
  }

  const tildeMatch = originalPeriod.match(tildePattern)
  if (tildeMatch) {
    const [_, year, monthFrom, dayFrom, monthTo, dayTo] = tildeMatch
    startDate = new Date(parseInt(year), parseInt(monthFrom) - 1, parseInt(dayFrom))
    endDate = new Date(parseInt(year), parseInt(monthTo) - 1, parseInt(dayTo))
  }

  const tildeYearMatch = originalPeriod.match(tildeYearPattern)
  if (tildeYearMatch) {
    const [_, yearFrom, monthFrom, dayFrom, yearTo, monthTo, dayTo] = tildeYearMatch
    startDate = new Date(parseInt(yearFrom), parseInt(monthFrom) - 1, parseInt(dayFrom))
    endDate = new Date(parseInt(yearTo), parseInt(monthTo) - 1, parseInt(dayTo))
  }

  return { originalPeriod, startDate, endDate }
}

export const WatchAnalysisStatusSchema = z.object({
  is_complete: z.boolean(),
  progress: z.number().min(0).max(1),
  message: z.string().min(1),
  result: z
    .object({
      ksicCode: z.string().min(1),
      ksicCategory: z.string().min(1),
      ksicHierarchy: z.object({
        large: z.object({ code: z.string().min(1), name: z.string().min(1) }),
        medium: z.object({ code: z.string().min(1), name: z.string().min(1) }),
        small: z.object({ code: z.string().min(1), name: z.string().min(1) }),
        detail: z.object({ code: z.string().min(1), name: z.string().min(1) }),
      }),
      marketSizeByYear: z.object({
        domestic: z
          .array(
            z.union([
              z.object({
                year: z.number(),
                size: z
                  .string()
                  .regex(/^\$\d+(,\d{3})*(\.\d+)?$/)
                  .transform(parseMoney),
                growthRate: z
                  .string()
                  .regex(/^-?\d+(\.\d+)?%$/)
                  .transform(parsePercentage),
              }),
              z.object({
                source: z.string().min(1),
              }),
            ]),
          )
          .transform(parseMarketSize),
        global: z
          .array(
            z.union([
              z.object({
                year: z.number(),
                size: z
                  .string()
                  .regex(/^\$\d+(,\d{3})*(\.\d+)?$/)
                  .transform(parseMoney),
                growthRate: z
                  .string()
                  .regex(/^-?\d+(\.\d+)?%$/)
                  .transform(parsePercentage),
              }),
              z.object({
                source: z.string().min(1),
              }),
            ]),
          )
          .transform(parseMarketSize),
      }),
      averageRevenue: z.object({
        domestic: z
          .string()
          .regex(/^\$\d+(,\d{3})*(\.\d+)?$/)
          .transform(parseMoney),
        global: z
          .string()
          .regex(/^\$\d+(,\d{3})*(\.\d+)?$/)
          .transform(parseMoney),
        source: z.string().min(1),
      }),
      similarServices: z.array(z.any()).optional(),
      targetAudience: z
        .array(
          z.object({
            segment: z.string().min(1),
            reasons: z.string().min(1),
            interestFactors: z.string().min(1),
            onlineActivities: z.string().min(1),
            onlineTouchpoints: z.string().min(1),
            offlineTouchpoints: z.string().min(1),
          }),
        )
        .min(1),
      businessModel: z.object({
        tagline: z.string().min(5).max(100),
        value: z.string().min(1),
        valueDetails: z.string().min(1),
        revenueStructure: z.string().min(1),
        investmentPriorities: z
          .array(
            z.object({
              name: z.string().min(1),
              description: z.string().min(1),
            }),
          )
          .min(1),
        breakEvenPoint: z.string().min(1),
      }),
      marketingStrategy: z.object({
        approach: z.string().min(1),
        channels: z.array(z.string()).min(1),
        messages: z.array(z.string()).min(1),
        budgetAllocation: z.string().min(1),
        kpis: z.array(z.string()).min(1),
        phasedStrategy: z.object({
          preLaunch: z.string().min(1),
          launch: z.string().min(1),
          growth: z.string().min(1),
        }),
      }),
      opportunities: z.array(z.string()).min(1),
      supportPrograms: z.array(
        z.object({
          name: z.string().min(1),
          organization: z.string().min(1),
          // amount: z
          //   .string()
          //   .regex(/^\$\d+(,\d{3})*(\.\d+)?$/)
          //   .transform(parseMoney),
          period: z.string().min(1).transform(parsePeriod),
        }),
      ),
      limitations: z.array(
        z.object({
          category: z.string().min(1),
          details: z.string().min(1),
          impact: z.string().min(1),
          solution: z.string().min(1),
        }),
      ),
      requiredTeam: z.object({
        roles: z
          .array(
            z.object({
              title: z.string().min(1),
              skills: z.string().min(1),
              responsibilities: z.string().min(1),
              priority: z.coerce.number().int().positive().min(1),
            }),
          )
          .min(1),
      }),
      scores: z.object({
        market: z.number().min(0).max(100),
        opportunity: z.number().min(0).max(100),
        similarService: z.number().min(0).max(100),
        risk: z.number().min(0).max(100),
        total: z.number().min(0).max(100),
      }),
      oneLineReview: z.string().min(1),
    })
    .optional(),
})

export type WatchAnalysisStatusDto = z.infer<typeof WatchAnalysisStatusSchema>
