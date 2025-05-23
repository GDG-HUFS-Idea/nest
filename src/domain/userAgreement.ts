import { User } from './user'
import { Term } from './term'

export class UserAgreement {
  id?: number
  userId!: number
  termId!: number
  hasAgreed!: boolean
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  // relation
  user?: User
  term?: Term

  constructor(param: {
    userId: number
    termId: number
    hasAgreed: boolean
    id?: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
    user?: User
    term?: Term
  }) {
    this.userId = param.userId
    this.termId = param.termId
    this.hasAgreed = param.hasAgreed
    this.id = param.id
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
    this.user = param.user
    this.term = param.term
  }
}
