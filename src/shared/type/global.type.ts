import { Id } from 'src/domain/vo/shared/id';
import { Role } from 'src/domain/vo/user/role';

declare global {
  interface Client {
    id: Id;
    roles: Role[];
  }

  interface Request {
    user?: Client;
  }
}
