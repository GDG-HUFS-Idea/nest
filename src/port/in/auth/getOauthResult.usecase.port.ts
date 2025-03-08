import { IsString } from 'class-validator'
import { Permission } from 'src/shared/type/enum.type'

export const CALLBACK_OAUTH_USECASE = Symbol('CALLBACK_OAUTH_USECASE')

export interface CallbackOauthUsecasePort {
  exec(dto: CallbackOauthUsecaseDto): Promise<CallbackOauthUsecaseRes>
}

export class CallbackOauthUsecaseDto {
  @IsString()
  code!: string
}

export type CallbackOauthUsecaseRes =
  | {
      has_account: true
      token: string
      user: {
        id: number
        permissions: Permission[]
      }
    }
  | {
      has_account: false
      session_id: string
      term_ids: number[]
    }
