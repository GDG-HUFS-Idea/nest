import { TermType } from 'src/shared/enum/enum'
import { UserAgreement } from './userAgreement'

export class Term {
  id?: number
  type!: TermType
  title!: string
  content!: string
  isRequired!: boolean
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date

  // relation
  userAgreements?: UserAgreement[]

  constructor(param: {
    id?: number
    type: TermType
    isRequired: boolean
    title: string
    content: string
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
    userAgreements?: UserAgreement[]
  }) {
    this.id = param.id
    this.type = param.type
    this.isRequired = param.isRequired
    this.title = param.title
    this.content = param.content
    this.createdAt = param.createdAt ?? new Date()
    this.updatedAt = param.updatedAt ?? new Date()
    this.deletedAt = param.deletedAt
    this.userAgreements = param.userAgreements
  }
}
