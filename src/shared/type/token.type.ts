import { Permission } from './enum.type'

export type Token = {
  id: number
  permissions: Permission[]
}
