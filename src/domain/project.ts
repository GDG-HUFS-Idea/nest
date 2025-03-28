import { AnalysisOverview } from './analysisOverview'
import { Idea } from './idea'

export class Project {
  id?: number
  userId!: number
  name!: string
  industryPath!: string
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  // relation
  user?: User
  ideas?: Idea[]
  analysisOverview?: AnalysisOverview

  constructor(param: {
    userId: number
    name: string
    industryPath: string
    id?: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
    user?: User
    ideas?: Idea[]
    analysisOverview?: AnalysisOverview
  }) {
    this.userId = param.userId
    this.name = param.name
    this.industryPath = param.industryPath
    this.id = param.id
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
    this.user = param.user
    this.ideas = param.ideas
    this.analysisOverview = param.analysisOverview
  }
}
