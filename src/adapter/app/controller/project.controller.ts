import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common'
import {
  GET_ANALYSIS_OVERVIEW_USECASE,
  GetAnalysisOverviewUsecasePort,
} from 'src/port/in/project/getAnalysisOverviewUsecase.port'
import {
  GET_MY_PROJECT_LIST_USECASE,
  GetMyProjectListUsecasePort,
} from 'src/port/in/project/getMyProjectListUsecase.port'
import { GetAnalysisOverviewUsecaseDto } from '../dto/project/getAnalysisOverviewUsecaseDto'
import { User } from '../paramDecorator/user.decorator'
import { JwtGuard } from '../auth/jwt/jwt.guard'

@Controller('/projects')
export class ProjectController {
  constructor(
    @Inject(GET_ANALYSIS_OVERVIEW_USECASE)
    private readonly getAnalysisOverviewUsecase: GetAnalysisOverviewUsecasePort,
    @Inject(GET_MY_PROJECT_LIST_USECASE)
    private readonly getMyProjectListUsecase: GetMyProjectListUsecasePort,
  ) {}

  @Get('/analyses/overview')
  @UseGuards(JwtGuard)
  async getAnalysisOverview(
    @Query() dto: GetAnalysisOverviewUsecaseDto,
    @User() user: User,
  ) {
    return this.getAnalysisOverviewUsecase.exec(dto, user)
  }

  @Get('/my')
  @UseGuards(JwtGuard)
  async getMyProjectList(@User() user: User) {
    return this.getMyProjectListUsecase.exec(user)
  }
}
