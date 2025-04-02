import { GetMyProjectListUsecaseDto } from 'src/adapter/app/dto/project/getMyProjectList.usecase.dto'

export const GET_MY_PROJECT_LIST_USECASE = Symbol('GET_MY_PROJECT_LIST_USECASE')

export interface GetMyProjectListUsecasePort {
  exec(
    dto: GetMyProjectListUsecaseDto,
    user: User,
  ): Promise<GetMyProjectListUsecaseRes>
}

export type GetMyProjectListUsecaseRes = {
  projects: {
    id: number
    name: string
  }[]
}
