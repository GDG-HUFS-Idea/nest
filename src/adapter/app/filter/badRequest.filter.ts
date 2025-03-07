import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'
import { Response } from 'express'
import { BadRequestException } from '@nestjs/common'

@Catch(BadRequestException)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()
    const status = exception.getStatus()

    const body = exception.getResponse() as any
    const msgs = body.message

    // 유효성 검사 실패로 인한 에러
    let code = 1

    if (Array.isArray(msgs)) {
      const isRequiredError = msgs.some(
        (msg) =>
          msg.includes('should not be empty') ||
          msg.includes('must not be empty') ||
          msg.includes('should not be null') ||
          msg.includes('should not be undefined'),
      )

      // 필수값 누락으로 인한 에러
      if (isRequiredError) {
        code = 0
      }
    }

    res.status(status).json({ code })
  }
}
