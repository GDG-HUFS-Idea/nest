import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/adapter/app/auth/jwt/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  // 각 테스트 케이스 전에 실행
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('validate', () => {
    it('payload를 도메인 객체로 변환하여 반환', async () => {
      const payload = {
        id: 123,
        roles: ['admin', 'general'] as ('admin' | 'general' | 'manager')[],
      };

      const result = await strategy.validate(payload);

      // 최종 반환 결과 비교
      expect(result.id.value).toBe(123);
      expect(result.roles).toHaveLength(2);
      expect(result.roles[0].value).toBe('admin');
      expect(result.roles[1].value).toBe('general');
    });
  });
});
