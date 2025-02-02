import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/adapter/postgres/drizzle/schema';

export type RdbInstance = NodePgDatabase<typeof schema>;
