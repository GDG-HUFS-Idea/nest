import { OauthSignUpUsecaseDto } from 'src/adapter/app/dto/auth/oauthSignUp.usecase.dto'
import { UserPermission } from 'src/shared/enum/enum'

export const OAUTH_SIGN_UP_USECASE = Symbol('OAUTH_SIGN_UP_USECASE')

export interface OauthSignUpUsecasePort {
  exec(dto: OauthSignUpUsecaseDto): Promise<OauthSignUpUsecaseRes>
}

export type OauthSignUpUsecaseRes = {
  token: string
  user: {
    id: number
    permissions: UserPermission[]
  }
}
