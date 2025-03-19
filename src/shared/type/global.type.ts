import { UserPermission } from '../enum/enum'

declare global {
  interface User {
    id: number
    permissions: UserPermission[]
  }

  interface OauthUser {
    name: string
    email: string
  }

  interface Request {
    user?: User | OauthUser
  }
}
