import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Permission } from 'src/shared/type/enum.type'

export const OAUTH_SIGN_UP_USECASE = Symbol('OAUTH_SIGN_UP_USECASE')

export interface OauthSignUpUsecasePort {
  exec(dto: OauthSignUpUsecaseDto): Promise<OauthSignUpUsecaseRes>
}

class UserAgreement {
  @IsNumber()
  term_id!: number

  @IsBoolean()
  has_agreed!: boolean
}

export class OauthSignUpUsecaseDto {
  @IsString()
  session_id!: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserAgreement)
  user_agreements!: UserAgreement[]
}

export type OauthSignUpUsecaseRes = {
  token: string
  user: {
    id: number
    permissions: Permission[]
  }
}
