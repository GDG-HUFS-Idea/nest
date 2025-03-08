import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from 'src/adapter/pg/drizzle/schema'

type Drizzle = ReturnType<typeof drizzle<typeof schema>>

export type RdbClient =
  | Drizzle
  | Parameters<Parameters<Drizzle['transaction']>[0]>[0]

export type Trx = Extract<
  RdbClient,
  Parameters<Parameters<RdbClient['transaction']>[0]>[0]
>
