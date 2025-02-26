import { defineConfig } from 'drizzle-kit';
import path from 'path';

const getHost = () => {
  return require('fs').existsSync('/.dockerenv') ? process.env.PG_HOST! : 'localhost';
};

export default defineConfig({
  schema: path.join(__dirname, 'schema.ts'),
  dialect: 'postgresql',

  verbose: true,

  dbCredentials: {
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    host: getHost(),
    port: Number(process.env.PG_PORT!),
    database: process.env.PG_DB!,
    ssl: false,
  },
});
