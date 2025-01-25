import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { RdbServicePort } from 'src/port/out/rdb/rdb.service.port';
import { RdbInstance } from 'src/shared/type/rdbInstance.type';
import * as schema from './orm/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class PgService implements RdbServicePort {
  private readonly pool: Pool;
  private readonly instance: RdbInstance;

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.getOrThrow('PG_USER'),
      password: this.configService.getOrThrow('PG_PW'),
      host: this.configService.getOrThrow('PG_HOST'),
      port: this.configService.getOrThrow('PG_PORT'),
      database: this.configService.getOrThrow('PG_DB'),
    });

    this.instance = drizzle(this.pool, { schema });
  }

  getInstance(): RdbInstance {
    return this.instance;
  }

  async transaction<T>(
    callback: (instance: RdbInstance) => Promise<T>,
  ): Promise<T> {
    const db = this.getInstance();
    return await db.transaction(callback);
  }
}
