import { Body, Controller, Get, HttpCode, Inject, Post, Query, Sse, UseGuards } from '@nestjs/common'
import { filter, map, mergeMap, takeWhile } from 'rxjs'
import {
  GET_ANALYSIS_OVERVIEW_USECASE,
  GetAnalysisOverviewUsecasePort,
} from 'src/port/in/project/getAnalysisOverview.usecase.port'
import {
  GET_MY_PROJECT_LIST_USECASE,
  GetMyProjectListUsecasePort,
} from 'src/port/in/project/getMyProjectList.usecase.port'
import { GetAnalysisOverviewUsecaseDto } from '../dto/project/getAnalysisOverview.usecase.dto'
import { User } from '../paramDecorator/user.decorator'
import { JwtGuard } from '../auth/jwt/jwt.guard'
import { GetMyProjectListUsecaseDto } from '../dto/project/getMyProjectList.usecase.dto'
import { AnalyzeIdeaUsecaseDto } from '../dto/project/analyzeIdea.usecase.dto'
import { AnalyzeIdeaUsecasePort, ANALYZE_IDEA_USECASE } from 'src/port/in/project/analyzeIdea.usecase.port'
import {
  WATCH_ANALYSIS_STATUS_USECASE,
  WatchAnalysisStatusUsecasePort,
} from 'src/port/in/project/watchAnalysisStatus.usecase.port'
import { WatchAnalysisStatusUsecaseDto } from '../dto/project/watchAnalysisStatus.usecase.dto'

@Controller('/projects')
export class ProjectController {
  constructor(
    @Inject(GET_ANALYSIS_OVERVIEW_USECASE)
    private readonly getAnalysisOverviewUsecase: GetAnalysisOverviewUsecasePort,
    @Inject(GET_MY_PROJECT_LIST_USECASE)
    private readonly getMyProjectListUsecase: GetMyProjectListUsecasePort,
    @Inject(ANALYZE_IDEA_USECASE)
    private readonly analyzeIdeaUsecase: AnalyzeIdeaUsecasePort,
    @Inject(WATCH_ANALYSIS_STATUS_USECASE)
    private readonly watchAnalysisStatusUsecase: WatchAnalysisStatusUsecasePort,
  ) {}

  @Get('/analyses/overview')
  @UseGuards(JwtGuard)
  async getAnalysisOverview(@Query() dto: GetAnalysisOverviewUsecaseDto, @User() user: User) {
    return this.getAnalysisOverviewUsecase.exec(dto, user)
  }

  @Post('/analyses/overview')
  @HttpCode(202)
  @UseGuards(JwtGuard)
  async analyzeIdea(@Body() dto: AnalyzeIdeaUsecaseDto, @User() user: User) {
    return this.analyzeIdeaUsecase.exec(dto, user)
  }

  @Sse('/analyses/overview/status')
  @UseGuards(JwtGuard)
  async watchAnalysisStatus(@Query() dto: WatchAnalysisStatusUsecaseDto, @User() user: User) {
    return (await this.watchAnalysisStatusUsecase.exec(dto, user)).pipe(
      mergeMap((promise) => promise),
      filter((result) => !!result),
      map((result) => ({ data: result })),
      takeWhile((result) => result.data.is_complete !== true, true),
    )
  }

  @Get('/my')
  @UseGuards(JwtGuard)
  async getMyProjectList(@Query() dto: GetMyProjectListUsecaseDto, @User() user: User) {
    return this.getMyProjectListUsecase.exec(dto, user)
  }
}
