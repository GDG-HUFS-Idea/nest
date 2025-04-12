import { OauthSignupUsecaseDto } from 'src/adapter/app/dto/auth/oauthSignup.usecase.dto'
import { UserPermission } from 'src/shared/enum/enum'

export const OAUTH_SIGNUP_USECASE = Symbol('OAUTH_SIGNUP_USECASE')

export interface OauthSignupUsecasePort {
  exec(dto: OauthSignupUsecaseDto): Promise<OauthSignupUsecaseRes>
}

export type OauthSignupUsecaseRes = {
  token: string
  user: {
    id: number
    permissions: UserPermission[]
  }
}
