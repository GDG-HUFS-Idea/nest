import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'

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
