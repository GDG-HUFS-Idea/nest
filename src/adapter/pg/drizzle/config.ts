import { defineConfig } from 'drizzle-kit'
import { getPgHost } from '../helper/getPgHost'
import path from 'path'

export default defineConfig({
  schema: path.join(__dirname, 'schema.ts'),
  dialect: 'postgresql',

  verbose: true,

  dbCredentials: {
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    host: getPgHost(),
    port: Number(process.env.PG_PORT!),
    database: process.env.PG_DB!,
    ssl: false,
  },
})
