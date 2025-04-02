import { GetAnalysisOverviewUsecaseDto } from 'src/adapter/app/dto/project/getAnalysisOverview.usecase.dto'
import { Currency, Region } from 'src/shared/enum/enum'

export const GET_ANALYSIS_OVERVIEW_USECASE = Symbol(
  'GET_ANALYSIS_OVERVIEW_USECASE',
)

export interface GetAnalysisOverviewUsecasePort {
  exec(
    dto: GetAnalysisOverviewUsecaseDto,
    user: User,
  ): Promise<GetAnalysisOverviewUsecaseRes>
}

export type GetAnalysisOverviewUsecaseRes = {
  summary: string
  review: string
  project: {
    id: number
    name: string
  }
  similar_service: {
    score: number
    items: {
      description: string
      logo_url: string
      website_url: string
      tags: string[]
      summary: string
    }[]
  }
  support_programs: {
    name: string
    organizer: string
    url: string
    start_date: Date
    end_date: Date
  }[]
  market_stats: {
    industry_path: string[]
    score: number
    market_trend: {
      [key in Region]: {
        year: number
        volume: number
        currency: Currency
        growth_rate: number
        source: string
      }[]
    }
    avg_revenue: {
      [key in Region]: {
        amount: number
        currency: Currency
        source: string
      }
    }
  }
  target_markets: {
    target: string
    icon_url: string
    order: number
    reasons: string[]
    appeal: string[]
    online_activity: string[]
    online_channels: string[]
    offline_channels: string[]
  }[]
  marketing_strategies: {
    title: string
    details: {
      label: string
      description: string
    }[]
  }[]
  business_model: {
    summary: string
    value_prop: {
      content: string
      details: {
        label: string
        description: string
      }[]
    }
    revenue: {
      label: string
      description: string
      details: string[]
    }[]
    investments: {
      order: number
      section: string
      details: {
        label: string
        description: string
      }[]
    }[]
  }
  opportunity: {
    score: number
    items: {
      title: string
      description: string
    }[]
  }
  limitation: {
    score: number
    items: {
      category: string
      detail: string
      impact: string
      solution: string
    }[]
  }
  team_requirements: {
    order: number
    role: string
    skills: string[]
    tasks: string[]
    salary_min: number
    salary_max: number
    currency: string
  }[]
}
