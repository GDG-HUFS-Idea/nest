import { TermType } from '../enum/enum'

export const getSignUpTermTypes = () => {
  return [
    TermType.MARKETING,
    TermType.TERMS_OF_SERVICE,
    TermType.PRIVACY_POLICY,
  ]
}
