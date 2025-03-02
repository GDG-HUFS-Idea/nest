import { Injectable, OnModuleInit } from '@nestjs/common'
import { PgService } from './pg.service'
import * as schema from './drizzle/schema'
import { userSeeds } from './seed/userSeeds'
import { userAgreementSeeds } from './seed/userAgreementSeeds'
import { termSeeds } from './seed/termSeeds'
import { sql } from 'drizzle-orm'
import { RdbClient } from 'src/shared/type/rdbClient.type'

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly pgService: PgService) {}

  async onModuleInit() {
    await this.pgService.getClient().transaction(async (ctx) => {
      await this.truncateAllTables(ctx)
      await this.insertSeeds(ctx)
      await this.resetAllSeqs(ctx)
    })
  }

  private async insertSeeds(ctx: RdbClient) {
    await ctx.insert(schema.users).values(userSeeds)
    await ctx.insert(schema.terms).values(termSeeds)
    await ctx.insert(schema.userAgreements).values(userAgreementSeeds)
  }

  private async truncateAllTables(ctx: RdbClient) {
    const { rows } = await ctx.execute(sql`
      SELECT table_name  AS "tableName"
      FROM information_schema.tables
      WHERE 
        table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `)

    await ctx.execute(sql`SET session_replication_role = 'replica'`)

    for (const { tableName } of rows) {
      await ctx.execute(sql`
        TRUNCATE TABLE ${sql.identifier(tableName as string)} CASCADE
      `)
    }

    await ctx.execute(sql`SET session_replication_role = 'origin'`)
  }

  private async resetAllSeqs(ctx: RdbClient) {
    const { rows } = await ctx.execute(sql`
      SELECT 
        t.table_name AS "tableName", 
        pg_get_serial_sequence(t.table_name, c.column_name) AS "seqName"
      FROM 
        information_schema.tables t
      JOIN 
        information_schema.columns c ON t.table_name = c.table_name
      WHERE 
        t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND c.column_name = 'id'
        AND pg_get_serial_sequence(t.table_name, c.column_name) IS NOT NULL
    `)

    for (const { tableName, seqName } of rows) {
      await ctx.execute(sql`
        SELECT setval(
          ${seqName}, 
          COALESCE((
            SELECT MAX(id)
            FROM ${sql.identifier(tableName as string)}
          ), 1),
          true
        )
      `)
    }
  }
}
