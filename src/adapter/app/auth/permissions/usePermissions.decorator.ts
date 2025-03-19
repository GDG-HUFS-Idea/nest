import { Reflector } from '@nestjs/core'
import { UserPermission } from 'src/shared/enum/enum'

export const UsePermissions = Reflector.createDecorator<UserPermission[]>()
