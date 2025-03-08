import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { USER_REPO } from 'src/port/out/repo/user.repo.port'
import { PgService } from './pg.service'
import { UserRepo } from './repo/user.repo'
import { TermRepo } from './repo/term.repo'
import { UserAgreementRepo } from './repo/userAgreement.repo'
import { USER_AGREEMENT_REPO } from 'src/port/out/repo/userAgreement.repo.port'
import { TERM_REPO } from 'src/port/out/repo/term.repo.port'
import { TRX_SERVICE } from 'src/port/out/service/trx.service.port'
import { TrxService } from './trx.service'
import { SeedService } from './seed.service'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],

  providers: [
    PgService,
    SeedService,
    { provide: TRX_SERVICE, useClass: TrxService },

    { provide: USER_REPO, useClass: UserRepo },
    { provide: TERM_REPO, useClass: TermRepo },
    { provide: USER_AGREEMENT_REPO, useClass: UserAgreementRepo },
  ],

  exports: [TRX_SERVICE, USER_REPO, TERM_REPO, USER_AGREEMENT_REPO],
})
export class PgModule {}
