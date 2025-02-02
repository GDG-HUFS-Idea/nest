import { User } from 'src/domain/entity/user';
import { Email } from 'src/domain/vo/email';
import { RdbInstance } from 'src/shared/type/rdbInstance.type';

export const USER_RDB_REPO = Symbol('USER_RDB_REPO');

export interface UserRdbRepositoryPort {
  saveUser(user: User, instance?: RdbInstance): Promise<User>;

  findUserByEmail(email: Email, instance?: RdbInstance): Promise<User | undefined>;
}
