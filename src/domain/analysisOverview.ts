import { Project } from './project'

type SimilarService = {
  description: string
  logoUrl: string
  websiteUrl: string
  tags: string[]
  summary: string
}

type SupportProgram = {
  name: string
  organizer: string
  url: string
  startDate: Date
  endDate: Date
}

type TargetMarket = {
  target: string
  iconUrl: string
  order: number
  reasons: string[]
  appeal: string[]
  onlineActivity: string[]
  onlineChannels: string[]
  offlineChannels: string[]
}

type MarketingStrategy = {
  title: string
  details: {
    label: string
    description: string
  }[]
}

type BusinessModelDetail = {
  label: string
  description: string
}

type BusinessModel = {
  summary: string
  valueProp: {
    content: string
    details: BusinessModelDetail[]
  }
  revenue: {
    label: string
    description: string
    details: string[]
  }[]
  investments: {
    order: number
    section: string
    details: BusinessModelDetail[]
  }[]
}

type Opportunity = {
  title: string
  description: string
}

type Limitation = {
  category: string
  detail: string
  impact: string
  solution: string
}

type TeamRequirement = {
  order: number
  role: string
  skills: string[]
  tasks: string[]
  salaryMin: number
  salaryMax: number
  currency: string
}

export class AnalysisOverview {
  id?: number
  projectId!: number
  summary!: string
  industryPath!: string
  review!: string
  similarServicesScore!: number
  limitationsScore!: number
  opportunitiesScore!: number
  similarServices!: SimilarService[]
  supportPrograms!: SupportProgram[]
  targetMarkets!: TargetMarket[]
  marketingStrategies!: MarketingStrategy[]
  businessModel!: BusinessModel
  opportunities!: Opportunity[]
  limitations!: Limitation[]
  teamRequirements!: TeamRequirement[]
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  // relation
  project?: Project

  constructor(param: {
    projectId: number
    summary: string
    industryPath: string
    review: string
    similarServicesScore: number
    limitationsScore: number
    opportunitiesScore: number
    similarServices: SimilarService[]
    supportPrograms: SupportProgram[]
    targetMarkets: TargetMarket[]
    marketingStrategies: MarketingStrategy[]
    businessModel: BusinessModel
    opportunities: Opportunity[]
    limitations: Limitation[]
    teamRequirements: TeamRequirement[]
    id?: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
    project?: Project
  }) {
    this.projectId = param.projectId
    this.summary = param.summary
    this.industryPath = param.industryPath
    this.review = param.review
    this.similarServicesScore = param.similarServicesScore
    this.limitationsScore = param.limitationsScore
    this.opportunitiesScore = param.opportunitiesScore
    this.similarServices = param.similarServices
    this.supportPrograms = param.supportPrograms
    this.targetMarkets = param.targetMarkets
    this.marketingStrategies = param.marketingStrategies
    this.businessModel = param.businessModel
    this.opportunities = param.opportunities
    this.limitations = param.limitations
    this.teamRequirements = param.teamRequirements
    this.id = param.id
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
    this.project = param.project
  }
}
