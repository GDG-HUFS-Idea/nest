import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { USER_RDB_REPO } from 'src/port/out/rdb/user.rdb.repo.port';
import { UserPgRepo } from './repo/user.pg.repo';
import { PgService } from './pg.service';
import { RDB_SERVICE } from 'src/port/out/rdb/rdb.service.port';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],

  providers: [
    // factory를 통한 비동기 인스턴스 관리
    {
      provide: RDB_SERVICE,
      useFactory: (configService: ConfigService) =>
        new PgService(configService),
      inject: [ConfigService],
    },
    { provide: USER_RDB_REPO, useClass: UserPgRepo },
  ],

  exports: [USER_RDB_REPO],
})
export class PgModule {}
