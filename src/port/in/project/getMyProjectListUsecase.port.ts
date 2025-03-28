export const GET_MY_PROJECT_LIST_USECASE = Symbol('GET_MY_PROJECT_LIST_USECASE')

export interface GetMyProjectListUsecasePort {
  exec(user: User): Promise<GetMyProjectListUsecaseRes>
}

export type GetMyProjectListUsecaseRes = {
  projects: {
    id: number
    name: string
  }[]
}
