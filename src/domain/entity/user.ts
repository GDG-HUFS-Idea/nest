import { Email } from '../vo/email';
import { Id } from '../vo/id';
import { ImgUrl } from '../vo/imgUrl';
import { Role } from '../vo/role';
import { Timestamp } from '../vo/timestamp';
import { Username } from '../vo/username';

export class User {
  // db의 serial (increment key)에 의존하여 nullable, 만약 코드 상에서 생성할거라면 not null (!)로 수정
  id?: Id;

  email!: Email;
  username!: Username;
  roles!: Role[];
  profileImgUrl!: ImgUrl;

  // db의 default 그리고 on update에 의존하여 nullable, 만약 코드 상에서 생성할거라면 not null (!)로 수정
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  // 언제 삭제 되었는지 확인이 필요한 상황이 올수도 있어 nullable
  deletedAt?: Timestamp;
}
