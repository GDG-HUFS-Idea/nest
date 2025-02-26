import { Term } from 'src/domain/term'
import { TermType } from 'src/shared/type/enum.type'
import { RdbClient } from 'src/shared/type/rdbClient.type'

export const TERM_REPO = Symbol('TERM_REPO')

export interface TermRepoPort {
  findOneById(param: { id: number; ctx?: RdbClient }): Promise<Term | null>
  findManyByIds(param: {
    ids: number[]
    ctx?: RdbClient
  }): Promise<Term[] | null>
  findLatestByTypes(param: {
    types: TermType[]
    ctx?: RdbClient
  }): Promise<Term[] | null>

  saveOne(param: { term: Term; ctx?: RdbClient }): Promise<Term>
}
