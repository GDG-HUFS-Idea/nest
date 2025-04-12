import { BadGatewayException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  GetMyProjectListUsecasePort,
  GetMyProjectListUsecaseRes,
} from 'src/port/in/project/getMyProjectList.usecase.port'
import { GetMyProjectListUsecaseDto } from 'src/adapter/app/dto/project/getMyProjectList.usecase.dto'
import { ProjectRepoPort, PROJECT_REPO } from 'src/port/out/repo/project.repo.port'
import { Project } from 'src/domain/project'

@Injectable()
export class GetMyProjectListUsecase implements GetMyProjectListUsecasePort {
  constructor(@Inject(PROJECT_REPO) private readonly projectRepo: ProjectRepoPort) {}

  async exec(dto: GetMyProjectListUsecaseDto, user: User): Promise<GetMyProjectListUsecaseRes> {
    const projects = await this.getProjects(user, dto)

    return this.buildRes(projects)
  }

  private buildRes(projects: Project[]) {
    return { projects: projects.map((project) => ({ id: project.id!, name: project.name })) }
  }

  private async getProjects(user: User, dto: GetMyProjectListUsecaseDto) {
    const projects = await this.projectRepo
      .findManyByUserId({
        userId: user.id,
        offset: dto.offset,
        limit: dto.limit,
      })
      .catch(() => {
        throw new BadGatewayException()
      })

    if (!projects) {
      throw new NotFoundException()
    }

    return projects
  }
}
