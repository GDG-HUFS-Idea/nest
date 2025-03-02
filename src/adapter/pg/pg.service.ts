import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'
import { RdbClient } from 'src/shared/type/rdbClient.type'
import * as schema from './drizzle/schema'
import { drizzle } from 'drizzle-orm/node-postgres'
import { getPgHost } from './helper/getPgHost'

@Injectable()
export class PgService {
  private readonly pool: Pool
  private readonly client: RdbClient

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.getOrThrow('PG_USER'),
      password: this.configService.getOrThrow('PG_PASSWORD'),
      host: getPgHost(),
      port: this.configService.getOrThrow('PG_PORT'),
      database: this.configService.getOrThrow('PG_DB'),
    })

    this.client = drizzle(this.pool, { schema })
  }

  getClient(): RdbClient {
    return this.client
  }
}
