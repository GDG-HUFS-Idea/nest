import { Test, TestingModule } from '@nestjs/testing'
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsGuard } from 'src/adapter/app/auth/permissions/permissions.guard'
import { UsePermissions } from 'src/adapter/app/auth/permissions/usePermissions.decorator'

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard
  let reflector: Reflector

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    guard = module.get<PermissionsGuard>(PermissionsGuard)
    reflector = module.get<Reflector>(Reflector)
  })

  it('권한 확인이 필요 없는 경우 true 반환', () => {
    const reqCtx = createMockReqCtx()
    jest.spyOn(reflector, 'get').mockReturnValue(undefined)

    expect(guard.canActivate(reqCtx)).toBe(true)
    expect(reflector.get).toHaveBeenCalledWith(
      UsePermissions,
      reqCtx.getHandler(),
    )
  })

  it('사용자 정보가 없는 경우 Unauthorized 발생', () => {
    const reqCtx = createMockReqCtx({
      user: null,
    })
    jest.spyOn(reflector, 'get').mockReturnValue(['admin'])

    expect(() => guard.canActivate(reqCtx)).toThrow(UnauthorizedException)
  })

  it('필요한 권한이 없는 경우 Forbidden 발생', () => {
    const reqCtx = createMockReqCtx({
      user: {
        id: 1,
        permissions: ['general'],
      },
    })
    jest.spyOn(reflector, 'get').mockReturnValue(['admin'])

    expect(() => guard.canActivate(reqCtx)).toThrow(ForbiddenException)
  })

  it('필요한 권한이 있는 경우 true 반환', () => {
    const reqCtx = createMockReqCtx({
      user: {
        id: 1,
        permissions: ['admin', 'general'],
      },
    })
    jest.spyOn(reflector, 'get').mockReturnValue(['admin'])

    expect(guard.canActivate(reqCtx)).toBe(true)
  })

  it('여러 권한 중 하나라도 있으면 true 반환', () => {
    const reqCtx = createMockReqCtx({
      user: {
        id: 1,
        permissions: ['general'],
      },
    })
    jest
      .spyOn(reflector, 'get')
      .mockReturnValue(['admin', 'general', 'premium'])

    expect(guard.canActivate(reqCtx)).toBe(true)
  })
})

function createMockReqCtx(data: any = {}): ExecutionContext {
  const mockRequest = {
    user: data.user,
  }

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext
}
