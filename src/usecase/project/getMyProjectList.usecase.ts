import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  GetMyProjectListUsecasePort,
  GetMyProjectListUsecaseRes,
} from 'src/port/in/project/getMyProjectList.usecase.port'
import { GetMyProjectListUsecaseDto } from 'src/adapter/app/dto/project/getMyProjectList.usecase.dto'
import { ProjectRepoPort } from 'src/port/out/repo/project.repo.port'
import { PROJECT_REPO } from 'src/port/out/repo/project.repo.port'
import { Project } from 'src/domain/project'

@Injectable()
export class GetMyProjectListUsecase implements GetMyProjectListUsecasePort {
  constructor(
    @Inject(PROJECT_REPO)
    private readonly projectRepo: ProjectRepoPort,
  ) {}

  async exec(
    dto: GetMyProjectListUsecaseDto,
    user: User,
  ): Promise<GetMyProjectListUsecaseRes> {
    const projects = await this.retrieveUserProjects(
      user.id,
      dto.offset,
      dto.limit,
    )
    return this.buildRes(projects)
  }

  // 사용자의 프로젝트 목록 조회
  private async retrieveUserProjects(
    userId: number,
    offset: number,
    limit: number,
  ) {
    let projects: Project[] | null
    try {
      projects = await this.projectRepo.findManyByUserId({
        userId: userId,
        offset: offset,
        limit: limit,
      })
    } catch (error) {
      throw new BadGatewayException()
    }

    if (!projects) {
      throw new NotFoundException()
    }

    return projects
  }

  // 응답 데이터 구성
  private buildRes(projects: Project[]): GetMyProjectListUsecaseRes {
    return {
      projects: projects.map((project) => ({
        id: project.id!,
        name: project.name,
      })),
    }
  }
}
