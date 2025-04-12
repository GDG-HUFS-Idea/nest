import { Project } from './project'

type SimilarServices = {
  description: string
  logoUrl: string
  websiteUrl: string
  tags: string[]
  summary: string
}[]

type SupportPrograms = {
  name: string
  organizer: string
  // url: string
  startDate?: Date
  endDate?: Date
}[]

type TargetMarkets = {
  target: string
  // iconUrl: string
  order: number
  reason: string // string[]
  appeal: string // string[]
  onlineActivity: string // string[]
  onlineChannels: string // string[]
  offlineChannels: string // string[]
}[]

// type MarketingStrategy = {
//   title: string
//   details: {
//     label: string
//     description: string
//   }[]
// }

type BusinessModel = {
  summary: string
  valueProp: string
  revenue: string
  investments: {
    order: number
    section: string
    description: string
  }[]
}

// type BusinessModelDetail = {
//   label: string
//   description: string
// }
// type BusinessModel = {
//   summary: string
//   valueProp: {
//     content: string
//     details: BusinessModelDetail[]
//   }
//   revenue: {
//     label: string
//     description: string
//     details: string[]
//   }[]
//   investments: {
//     order: number
//     section: string
//     details: BusinessModelDetail[]
//   }[]
// }

type Opportunities = string[]
// type Opportunity = {
//   title: string
//   description: string
// }

type Limitations = {
  category: string
  detail: string
  impact: string
  solution: string
}[]

type TeamRequirements = {
  order: number
  title: string
  skill: string
  responsibility: string
}[]

export class AnalysisOverview {
  id?: number
  projectId!: number
  summary!: string
  industryPath!: string
  review!: string
  similarServicesScore!: number
  limitationsScore!: number
  opportunitiesScore!: number
  similarServices!: SimilarServices
  supportPrograms!: SupportPrograms
  targetMarkets!: TargetMarkets
  // marketingStrategies!: MarketingStrategy
  businessModel!: BusinessModel
  opportunities!: Opportunities
  limitations!: Limitations
  teamRequirements!: TeamRequirements
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
    similarServices: SimilarServices
    supportPrograms: SupportPrograms
    targetMarkets: TargetMarkets
    // marketingStrategies: MarketingStrategy
    businessModel: BusinessModel
    opportunities: Opportunities
    limitations: Limitations
    teamRequirements: TeamRequirements
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
    // this.marketingStrategies = param.marketingStrategies
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
