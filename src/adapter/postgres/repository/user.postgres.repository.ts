import { Inject, Injectable } from '@nestjs/common';
import { UserRdbRepositoryPort } from 'src/port/out/rdb/user.rdb.repository.port';
import * as schema from '../drizzle/schema';
import { RDB_SERVICE, RdbServicePort } from 'src/port/out/rdb/rdb.service.port';
import { User } from 'src/domain/entity/user';
import { and, eq, InferSelectModel, isNull } from 'drizzle-orm';
import { Builder } from 'builder-pattern';
import { Id } from 'src/domain/vo/id';
import { Email } from 'src/domain/vo/email';
import { Username } from 'src/domain/vo/username';
import { Role } from 'src/domain/vo/role';
import { ImgUrl } from 'src/domain/vo/imgUrl';
import { Timestamp } from 'src/domain/vo/timestamp';

@Injectable()
export class UserPostgresRepository implements UserRdbRepositoryPort {
  constructor(
    @Inject(RDB_SERVICE)
    private readonly rdbService: RdbServicePort,
  ) {}

  async saveUser(user: User, instance = this.rdbService.getInstance()): Promise<User> {
    const [row] = await instance
      .insert(schema.users)
      .values({
        email: user.email.value,
        username: user.username.value,
        roles: user.roles.map((role) => role.value),
        profileImgUrl: user.profileImgUrl.value,
      })
      .returning();

    return this.mapToUser(row);
  }

  async findUserByEmail(email: Email, instance = this.rdbService.getInstance()): Promise<User | undefined> {
    const row = await instance.query.users.findFirst({
      where: and(eq(schema.users.email, email.value), isNull(schema.users.deletedAt)),
    });

    return row && this.mapToUser(row);
  }

  private mapToUser(row: InferSelectModel<typeof schema.users>): User {
    return Builder(User)
      .id(Id.create(row.id))
      .email(Email.create(row.email))
      .username(Username.create(row.username))
      .roles(row.roles.map((role) => Role.create(role)))
      .profileImgUrl(ImgUrl.create(row.profileImgUrl))
      .createdAt(Timestamp.create(row.createdAt))
      .updatedAt(Timestamp.create(row.updatedAt))
      .deletedAt(row.updatedAt ? Timestamp.create(row.updatedAt) : undefined)
      .build();
  }
}
