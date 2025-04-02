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
import { MARKET_STATS_REPO } from 'src/port/out/repo/marketStats.repo.port'
import { MarketStatsRepo } from './repo/marketStats.repo'
import { PROJECT_REPO } from 'src/port/out/repo/project.repo.port'
import { ProjectRepo } from './repo/project.repo'
import { ANALYSIS_OVERVIEW_REPO } from 'src/port/out/repo/analysisOverview.repo.port'
import { AnalysisOverviewRepo } from './repo/analysisOverview.repo'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],

  providers: [
    PgService,
    SeedService,
    { provide: TRX_SERVICE, useClass: TrxService },

    { provide: USER_REPO, useClass: UserRepo },
    { provide: TERM_REPO, useClass: TermRepo },
    { provide: USER_AGREEMENT_REPO, useClass: UserAgreementRepo },
    { provide: MARKET_STATS_REPO, useClass: MarketStatsRepo },
    { provide: PROJECT_REPO, useClass: ProjectRepo },
    { provide: ANALYSIS_OVERVIEW_REPO, useClass: AnalysisOverviewRepo },
  ],

  exports: [
    TRX_SERVICE,
    USER_REPO,
    TERM_REPO,
    USER_AGREEMENT_REPO,
    MARKET_STATS_REPO,
    PROJECT_REPO,
    ANALYSIS_OVERVIEW_REPO,
  ],
})
export class PgModule {}
