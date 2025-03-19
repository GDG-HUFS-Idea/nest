import { UserPermission } from '../enum/enum'

export type Token = {
  id: number
  permissions: UserPermission[]
}
