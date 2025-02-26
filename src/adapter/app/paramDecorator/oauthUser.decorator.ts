import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OauthUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user;
  },
);
