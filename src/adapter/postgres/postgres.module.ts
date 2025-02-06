import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { USER_RDB_REPO } from 'src/port/out/rdb/user.rdb.repository.port';
import { UserPostgresRepository } from './repository/user.postgres.repository';
import { PostgresService } from './postgres.service';
import { RDB_SERVICE } from 'src/port/out/rdb/rdb.service.port';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],

  providers: [
    // factory를 통한 비동기 인스턴스 관리
    {
      provide: RDB_SERVICE,
      useFactory: (configService: ConfigService) => new PostgresService(configService),
      inject: [ConfigService],
    },
    { provide: USER_RDB_REPO, useClass: UserPostgresRepository },
  ],

  exports: [USER_RDB_REPO],
})
export class PgModule {}
