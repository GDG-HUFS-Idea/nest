import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class GlobalFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const body =
      exception instanceof HttpException ? exception.getResponse() : {}

    res
      .status(status)
      .json(
        typeof body === 'object' && body && 'code' in body
          ? { code: body.code }
          : undefined,
      )
  }
}
