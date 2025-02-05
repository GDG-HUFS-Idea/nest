import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from 'src/adapter/postgres/drizzle/schema';

type Drizzle = ReturnType<typeof drizzle<typeof schema>>;

export type RdbInstance = Drizzle | Parameters<Parameters<Drizzle['transaction']>[0]>[0];
