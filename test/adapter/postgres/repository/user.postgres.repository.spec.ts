import { Test, TestingModule } from '@nestjs/testing';
import { RDB_SERVICE } from 'src/port/out/rdb/rdb.service.port';
import { User } from 'src/domain/entity/user';
import { Email } from 'src/domain/vo/user/email';
import { Builder } from 'builder-pattern';
import { UserPostgresRepository } from 'src/adapter/postgres/repository/user.postgres.repository';
import { Username } from 'src/domain/vo/user/username';
import { Role } from 'src/domain/vo/user/role';
import { SubscriptionType } from 'src/domain/vo/user/subscriptionType';

describe('UserPostgresRepository', () => {
  let repository: UserPostgresRepository;
  let rdbService: any;

  // drizzle의 반환값을 모의하기 위한 mock 데이터
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    roles: ['general'],
    subscriptionType: 'free',
    subscriptionStartDate: undefined,
    subscriptionEndDate: undefined,
    createdDate: new Date(),
    lastModifiedDate: new Date(),
    deletedDate: undefined,
  };

  // 각 테스트 케이스 전에 실행
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPostgresRepository,
        {
          provide: RDB_SERVICE,
          useValue: {
            getInstance: jest.fn().mockReturnValue({
              insert: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              returning: jest.fn().mockResolvedValue([mockUser]),
              query: {
                users: {
                  findFirst: jest.fn(),
                },
              },
            }),
          },
        },
      ],
    }).compile();

    repository = module.get<UserPostgresRepository>(UserPostgresRepository);
    rdbService = module.get(RDB_SERVICE);
  });

  describe('saveUser', () => {
    it('사용자를 저장하고 저장된 사용자 엔티티를 반환', async () => {
      const user = Builder(User)
        .email(Email.create('test@example.com'))
        .username(Username.create('testuser'))
        .roles([Role.create('general')])
        .subscriptionType(SubscriptionType.create('free'))
        .build();

      const savedUser = await repository.saveUser(user);

      expect(savedUser.id?.value).toBe(1);
      expect(savedUser.email.value).toBe('test@example.com');
      expect(savedUser.username.value).toBe('testuser');
      expect(savedUser.roles[0].value).toBe('general');
      expect(savedUser.subscriptionType.value).toBe('free');
    });
  });

  describe('findUserByEmail', () => {
    it('이메일로 사용자를 찾아서 반환', async () => {
      const instance = rdbService.getInstance();
      instance.query.users.findFirst.mockResolvedValue(mockUser);

      const user = await repository.findUserByEmail(Email.create('test@example.com'));

      expect(user).toBeDefined();
      expect(user?.email.value).toBe('test@example.com');
    });

    it('사용자가 없으면 undefined 반환', async () => {
      const instance = rdbService.getInstance();
      instance.query.users.findFirst.mockResolvedValue(undefined);

      const user = await repository.findUserByEmail(Email.create('nonexistent@example.com'));

      expect(user).toBeUndefined();
    });
  });
});
