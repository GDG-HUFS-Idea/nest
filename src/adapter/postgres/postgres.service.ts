import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { RdbServicePort } from 'src/port/out/rdb/rdb.service.port';
import { RdbInstance } from 'src/shared/type/rdbInstance.type';
import * as schema from './drizzle/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class PostgresService implements RdbServicePort {
  private readonly pool: Pool;
  private readonly instance: RdbInstance;

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.getOrThrow('POSTGRES_USER'),
      password: this.configService.getOrThrow('POSTGRES_PASSWORD'),
      host: this.configService.getOrThrow('POSTGRES_HOST'),
      port: this.configService.getOrThrow('POSTGRES_PORT'),
      database: this.configService.getOrThrow('POSTGRES_DB'),
    });

    this.instance = drizzle(this.pool, { schema });
  }

  getInstance(): RdbInstance {
    return this.instance;
  }

  async transaction<T>(callback: (instance: RdbInstance) => Promise<T>): Promise<T> {
    const db = this.getInstance();
    return await db.transaction(callback);
  }
}
