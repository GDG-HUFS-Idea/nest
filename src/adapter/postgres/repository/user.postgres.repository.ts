import { Inject, Injectable } from '@nestjs/common';
import { UserRdbRepositoryPort } from 'src/port/out/rdb/user.rdb.repository.port';
import * as schema from '../drizzle/schema';
import { RDB_SERVICE, RdbServicePort } from 'src/port/out/rdb/rdb.service.port';
import { User } from 'src/domain/entity/user';
import { and, eq, InferSelectModel, isNull } from 'drizzle-orm';
import { Builder } from 'builder-pattern';
import { Id } from 'src/domain/vo/shared/id';
import { Email } from 'src/domain/vo/user/email';
import { Username } from 'src/domain/vo/user/username';
import { Role } from 'src/domain/vo/user/role';
import { Timestamp } from 'src/domain/vo/shared/timestamp';
import { SubscriptionType } from 'src/domain/vo/user/subscriptionType';

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
        subscriptionType: user.subscriptionType.value,
        subscriptionStartDate: user.subscriptionStartDate?.value,
        subscriptionEndDate: user.subscriptionEndDate?.value,
      })
      .returning();

    return this.mapToUser(row);
  }

  async findUserByEmail(email: Email, instance = this.rdbService.getInstance()): Promise<User | undefined> {
    const row = await instance.query.users.findFirst({
      where: and(eq(schema.users.email, email.value), isNull(schema.users.deletedDate)),
    });

    return row && this.mapToUser(row);
  }

  private mapToUser(row: InferSelectModel<typeof schema.users>): User {
    return Builder(User)
      .id(Id.create(row.id))
      .email(Email.create(row.email))
      .username(Username.create(row.username))
      .roles(row.roles.map((role) => Role.create(role)))
      .subscriptionType(SubscriptionType.create(row.subscriptionType))
      .subscriptionStartDate(row.subscriptionStartDate ? Timestamp.create(row.subscriptionStartDate) : undefined)
      .subscriptionEndDate(row.subscriptionEndDate ? Timestamp.create(row.subscriptionEndDate) : undefined)
      .createdDate(Timestamp.create(row.createdDate))
      .lastModifiedDate(Timestamp.create(row.lastModifiedDate))
      .deletedDate(row.deletedDate ? Timestamp.create(row.deletedDate) : undefined)
      .build();
  }
}
