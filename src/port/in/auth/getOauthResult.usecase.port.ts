import { CallbackOauthUsecaseDto } from 'src/adapter/app/dto/auth/callbackOauth.usecase.dto'
import { UserPermission } from 'src/shared/enum/enum'

export const CALLBACK_OAUTH_USECASE = Symbol('CALLBACK_OAUTH_USECASE')

export interface CallbackOauthUsecasePort {
  exec(dto: CallbackOauthUsecaseDto): Promise<CallbackOauthUsecaseRes>
}

export type CallbackOauthUsecaseRes =
  | {
      has_account: true
      token: string
      user: {
        id: number
        permissions: UserPermission[]
      }
    }
  | {
      has_account: false
      session_id: string
      term_ids: number[]
    }
