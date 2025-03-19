import { IsString } from 'class-validator'

export class CallbackOauthUsecaseDto {
  @IsString()
  code!: string
}
