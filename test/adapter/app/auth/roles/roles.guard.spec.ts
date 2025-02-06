import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from 'src/adapter/app/auth/roles/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  // 데코레이터의 메타데이터를 읽는데 사용되는 헬퍼
  let reflector: Reflector;

  // 각 테스트 케이스 전에 실행
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            // 실제 메타데이터 대신에 mock로 대체 (의존성 상관 x)
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('매개변수로 그 어떤 권한도 넣어지지 않았을때 모든 요청 수용', () => {
    // 빈 컨텍스트
    const context = createMockExecutionContext({});
    // reflector로 데코레이터의 메타데이터(매개변수)에 값을 전달
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('토큰이 유효하지 않을때 unauthorized 예외', () => {
    const context = createMockExecutionContext({});
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('admin 권한을 요구하고 또 가지고 있을때 수용', () => {
    const context = createMockExecutionContext({
      user: {
        // admin 권한을 가진 user
        roles: [{ value: 'admin' }],
      },
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('manager 권한을 요구하고 또 가지고 있을때 수용', () => {
    const context = createMockExecutionContext({
      user: {
        roles: [{ value: 'manager' }],
      },
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['manager']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('여러 권한을 요구하는 중에 하나를 가지고 있을때 수용', () => {
    const context = createMockExecutionContext({
      user: {
        roles: [{ value: 'general' }, { value: 'manager' }],
      },
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['manager']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('토큰은 있지만 권한이 부족할때 forbidden 예외', () => {
    const context = createMockExecutionContext({
      user: {
        roles: [{ value: 'general' }],
      },
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['manager', 'admin']);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

function createMockExecutionContext(partial: Partial<any>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => partial,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;
}
