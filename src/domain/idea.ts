import { Project } from './project'

export class Idea {
  id?: number
  projectId!: number
  problem!: string
  motivation!: string
  features!: string
  method!: string
  deliverable!: string
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  // relation
  project?: Project

  constructor(param: {
    projectId: number
    problem: string
    motivation: string
    features: string
    method: string
    deliverable: string
    id?: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
    project?: Project
  }) {
    this.projectId = param.projectId
    this.problem = param.problem
    this.motivation = param.motivation
    this.features = param.features
    this.method = param.method
    this.deliverable = param.deliverable
    this.id = param.id
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
    this.project = param.project
  }
}
