import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { USER_RDB_REPO } from 'src/port/out/rdb/user.rdb.repository.port';
import { User } from 'src/domain/entity/user';
import { Builder } from 'builder-pattern';
import { Email } from 'src/domain/vo/user/email';
import { Username } from 'src/domain/vo/user/username';
import { Role } from 'src/domain/vo/user/role';
import { SubscriptionType } from 'src/domain/vo/user/subscriptionType';
import { Id } from 'src/domain/vo/shared/id';
import { GoogleOauth2Strategy } from 'src/adapter/app/auth/oauth2/google/googleOauth2.strategy';

describe('GoogleOauth2Strategy', () => {
  let strategy: GoogleOauth2Strategy;
  let userRdbRepository: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleOauth2Strategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-jwt-token'),
          },
        },
        {
          provide: USER_RDB_REPO,
          useValue: {
            findUserByEmail: jest.fn(),
            saveUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleOauth2Strategy>(GoogleOauth2Strategy);
    userRdbRepository = module.get(USER_RDB_REPO);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validate', () => {
    const mockProfile = {
      _json: {
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    it('기존 사용자를 찾아서 jwt 토큰 발급', async () => {
      // repository에 기존 사용자 존재
      const existingUser = Builder(User)
        .id(Id.create(1))
        .email(Email.create('test@example.com'))
        .username(Username.create('Test User'))
        .roles([Role.create('general')])
        .subscriptionType(SubscriptionType.create('free'))
        .build();

      userRdbRepository.findUserByEmail.mockResolvedValue(existingUser);

      const done = jest.fn();
      await strategy.validate('access-token', 'refresh-token', mockProfile, done);

      // 기존 사용자 탐색에서 해당 email을 매개변수로 불렸는지 검증
      expect(userRdbRepository.findUserByEmail).toHaveBeenCalledWith(Email.create('test@example.com'));

      // jwt 토큰 생성 시 사용된 값 검증
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: existingUser.id!.value,
        roles: existingUser.roles.map((role) => role.value),
      });

      // 최종 반환 결과 검증
      expect(done).toHaveBeenCalledWith(null, { token: 'test-jwt-token' });
    });

    it('새로운 사용자를 생성하고 jwt 토큰 발급', async () => {
      userRdbRepository.findUserByEmail.mockResolvedValue(undefined);

      const expectedNewUser = Builder(User)
        .email(Email.create('test@example.com'))
        .username(Username.create('Test User'))
        .roles([Role.create('general')])
        .subscriptionType(SubscriptionType.create('free'))
        .build();

      const savedUser = Builder(User)
        .id(Id.create(2))
        .email(expectedNewUser.email)
        .username(expectedNewUser.username)
        .roles(expectedNewUser.roles)
        .subscriptionType(expectedNewUser.subscriptionType)
        .build();

      userRdbRepository.saveUser.mockResolvedValue(savedUser);

      const done = jest.fn();
      await strategy.validate('access-token', 'refresh-token', mockProfile, done);

      // saveUser에 전달된 인자의 vo 값들 비교
      const savedUserArg = userRdbRepository.saveUser.mock.calls[0][0];
      expect(savedUserArg.email.value).toBe(expectedNewUser.email.value);
      expect(savedUserArg.username.value).toBe(expectedNewUser.username.value);
      expect(savedUserArg.roles[0].value).toBe(expectedNewUser.roles[0].value);
      expect(savedUserArg.subscriptionType.value).toBe(expectedNewUser.subscriptionType.value);

      // sign이 다음 매개변수로 불렸는지
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: savedUser.id!.value,
        roles: savedUser.roles.map((role) => role.value),
      });

      // 최종 반환 결과 검증
      expect(done).toHaveBeenCalledWith(null, { token: 'test-jwt-token' });
    });
  });
});
