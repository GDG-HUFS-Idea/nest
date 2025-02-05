import { Email } from '../vo/user/email';
import { Id } from '../vo/shared/id';
import { Role } from '../vo/user/role';
import { Timestamp } from '../vo/shared/timestamp';
import { Username } from '../vo/user/username';
import { SubscriptionType } from '../vo/user/subscriptionType';

export class User {
  // db의 serial (increment key)에 의존하여 nullable, 만약 코드 상에서 생성할거라면 not null (!)로 수정
  id?: Id;

  email!: Email;
  username!: Username;
  roles!: Role[];
  subscriptionType!: SubscriptionType;
  subscriptionStartDate?: Timestamp;
  subscriptionEndDate?: Timestamp;

  // db의 default 그리고 on update에 의존하여 nullable, 만약 코드 상에서 생성할거라면 not null (!)로 수정
  createdDate?: Timestamp;
  lastModifiedDate?: Timestamp;

  // 언제 삭제 되었는지 확인이 필요한 상황이 올수도 있어 nullable
  deletedDate?: Timestamp;
}
