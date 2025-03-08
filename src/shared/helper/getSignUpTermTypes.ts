import { ENUM } from '../const/enum.const'

export const getSignUpTermTypes = () => {
  return [
    ENUM.TERM_TYPE.MARKETING,
    ENUM.TERM_TYPE.TERMS_OF_SERVICE,
    ENUM.TERM_TYPE.PRIVACY_POLICY,
  ]
}
