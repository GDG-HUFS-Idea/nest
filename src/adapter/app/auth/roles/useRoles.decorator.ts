import { Reflector } from '@nestjs/core';
import { Role } from 'src/domain/vo/user/role';
import { z } from 'zod';

export const UseRoles = Reflector.createDecorator<z.infer<typeof Role.schema>[]>();
