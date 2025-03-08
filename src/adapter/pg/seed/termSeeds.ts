import { InferInsertModel } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import { ENUM } from 'src/shared/const/enum.const'

export const termSeeds: InferInsertModel<typeof schema.terms>[] = [
  {
    id: 1,
    type: ENUM.TERM_TYPE.TERMS_OF_SERVICE,
    title: '서비스 이용약관',
    content:
      '본 이용약관은 당사가 제공하는 모든 서비스의 이용 조건을 정의합니다. 서비스를 이용함으로써 사용자는 본 약관에 동의한 것으로 간주됩니다.',
    isRequired: true,
  },
  {
    id: 2,
    type: ENUM.TERM_TYPE.PRIVACY_POLICY,
    title: '개인정보 처리방침',
    content:
      '당사는 사용자의 개인정보를 소중히 생각하며, 개인정보 보호법에 따라 이용자의 개인정보를 보호하고 안전하게 처리하는 데 최선을 다하고 있습니다.',
    isRequired: true,
  },
  {
    id: 3,
    type: ENUM.TERM_TYPE.MARKETING,
    title: '마케팅 정보 수신 동의',
    content:
      '동의하시면 새로운 기능, 이벤트 및 프로모션에 대한 정보를 이메일로 받아보실 수 있습니다. 언제든지 수신을 거부할 수 있습니다.',
    isRequired: false,
  },
]
