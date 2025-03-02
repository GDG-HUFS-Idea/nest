import { Permission } from './enum.type'

declare global {
  interface User {
    id: number
    permissions: Permission[]
  }

  interface OauthUser {
    name: string
    email: string
  }

  interface Request {
    user?: User | OauthUser
  }
}
