import { RdbClient } from 'src/shared/type/rdbClient.type'

export const TRX_SERVICE = Symbol('TRX_SERVICE')

export interface TrxServicePort {
  startTrx<T>(cb: (trx: RdbClient) => Promise<T>): Promise<T>
}
