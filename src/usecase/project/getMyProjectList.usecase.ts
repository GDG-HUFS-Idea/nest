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
import {
  ProjectRepoPort,
  PROJECT_REPO,
} from 'src/port/out/repo/project.repo.port'

@Injectable()
export class GetMyProjectListUsecase implements GetMyProjectListUsecasePort {
  constructor(
    @Inject(PROJECT_REPO) private readonly projectRepo: ProjectRepoPort,
  ) {}

  // 사용자 프로젝트 목록 조회 및 응답 반환
  async exec(
    dto: GetMyProjectListUsecaseDto,
    user: User,
  ): Promise<GetMyProjectListUsecaseRes> {
    const projects = await this.retrieveProjects(user.id, dto.offset, dto.limit)
    return this.buildResponse(projects)
  }

  // 프로젝트 데이터 조회
  private async retrieveProjects(
    userId: number,
    offset: number,
    limit: number,
  ) {
    try {
      const projects = await this.projectRepo.findManyByUserId({
        userId,
        offset,
        limit,
      })

      if (!projects) {
        throw new NotFoundException()
      }

      return projects
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadGatewayException()
    }
  }

  // 응답 데이터 구성
  private buildResponse(projects: any[]): GetMyProjectListUsecaseRes {
    return {
      projects: projects.map((project) => ({
        id: project.id!,
        name: project.name,
      })),
    }
  }
}
