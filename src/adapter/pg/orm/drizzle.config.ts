import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  schema: path.join(__dirname, 'schema.ts'),
  dialect: 'postgresql',

  // 상세 로깅 활성화 여부
  verbose: true,

  dbCredentials: {
    url: `postgresql://${process.env.PG_USER}:${process.env.PG_PW}@pg:5432/${process.env.PG_DB}`,
  },
});
