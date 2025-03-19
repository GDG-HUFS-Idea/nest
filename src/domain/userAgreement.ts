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

  constructor(params: {
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
    this.userId = params.userId
    this.termId = params.termId
    this.hasAgreed = params.hasAgreed
    this.id = params.id
    this.createdAt = params.createdAt ?? new Date()
    this.updatedAt = params.updatedAt ?? new Date()
    this.deletedAt = params.deletedAt
    this.user = params.user
    this.term = params.term
  }
}
