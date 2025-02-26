import { JwtService as OriginalJwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import { Token } from 'src/shared/type/token.type'

@Injectable()
export class JwtService {
  constructor(private readonly orignalJwtService: OriginalJwtService) {}
  generate(param: Pick<Token, 'id' | 'permissions'>) {
    return this.orignalJwtService.sign(param, { expiresIn: '3d' })
  }
}
