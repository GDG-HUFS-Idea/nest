import { Reflector } from '@nestjs/core'
import { Permission } from 'src/shared/type/enum.type'

export const UsePermissions = Reflector.createDecorator<Permission[]>()
