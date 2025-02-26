import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RedisRepo } from './redis.repo'
import { RedisService } from './redis.service'
import { CACHE_REPO } from 'src/port/out/repo/cache.repo.port'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],

  providers: [RedisService, { provide: CACHE_REPO, useClass: RedisRepo }],

  exports: [CACHE_REPO],
})
export class RedisModule {}
