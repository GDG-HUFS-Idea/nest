import { Injectable } from '@nestjs/common'
import { Trx } from 'src/shared/type/rdbClient.type'
import { PgService } from './pg.service'
import { TrxServicePort } from 'src/port/out/service/trx.service.port'

@Injectable()
export class TrxService implements TrxServicePort {
  constructor(private readonly pgService: PgService) {}

  async startTrx<T>(callback: (trx: Trx) => Promise<T>): Promise<T> {
    return await this.pgService.getClient().transaction(callback)
  }
}
