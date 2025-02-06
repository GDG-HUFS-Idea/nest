import { defineConfig } from 'drizzle-kit';
import path from 'path';

// 컨텍스트가 도커 컨테이너라면 process.env.POSTGRES_HOST를, 아니면 localhost를 사용
const getHost = () => {
  return require('fs').existsSync('/.dockerenv') ? process.env.POSTGRES_HOST! : 'localhost';
};

export default defineConfig({
  schema: path.join(__dirname, 'schema.ts'),
  dialect: 'postgresql',

  // 상세 로깅 활성화 여부
  verbose: true,

  dbCredentials: {
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    host: getHost(),
    port: Number(process.env.POSTGRES_PORT!),
    database: process.env.POSTGRES_DB!,
    ssl: false,
  },
});
