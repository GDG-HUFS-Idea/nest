// 5. GetMyProjectListUsecase 테스트
import { Test, TestingModule } from '@nestjs/testing'
import { GetMyProjectListUsecase } from 'src/usecase/project/getMyProjectList.usecase'
import {
  PROJECT_REPO,
  ProjectRepoPort,
} from 'src/port/out/repo/project.repo.port'
import { Project } from 'src/domain/project'
import { BadGatewayException, NotFoundException } from '@nestjs/common'
import { GetMyProjectListUsecaseDto } from 'src/adapter/app/dto/project/getMyProjectList.usecase.dto'
import { UserPermission } from 'src/shared/enum/enum'

describe('GetMyProjectListUsecase', () => {
  let usecase: GetMyProjectListUsecase
  let projectRepo: ProjectRepoPort

  // 테스트용 사용자 Mock 객체
  const mockUser: User = {
    id: 1,
    permissions: [UserPermission.GENERAL],
  }

  // 테스트용 프로젝트 목록 Mock 객체
  const mockProjects = [
    new Project({
      id: 1,
      userId: mockUser.id,
      name: '테스트 프로젝트 1',
      industryPath: 'tech/software',
    }),
    new Project({
      id: 2,
      userId: mockUser.id,
      name: '테스트 프로젝트 2',
      industryPath: 'tech/mobile',
    }),
    new Project({
      id: 3,
      userId: mockUser.id,
      name: '테스트 프로젝트 3',
      industryPath: 'tech/web',
    }),
  ]

  beforeEach(async () => {
    // Mock 객체 생성
    const mockProjectRepo: ProjectRepoPort = {
      findOneById: jest.fn(),
      findManyByUserId: jest.fn(),
      findOneByIdJoinAnalysisOverview: jest.fn(),
      saveOne: jest.fn(),
    }

    // 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyProjectListUsecase,
        {
          provide: PROJECT_REPO,
          useValue: mockProjectRepo,
        },
      ],
    }).compile()

    // 의존성 주입
    usecase = module.get<GetMyProjectListUsecase>(GetMyProjectListUsecase)
    projectRepo = module.get<ProjectRepoPort>(PROJECT_REPO)
  })

  it('사용자의 프로젝트 목록을 성공적으로 조회하여 반환', async () => {
    // 준비
    const offset = 0
    const limit = 10
    const dto: GetMyProjectListUsecaseDto = { offset, limit }

    // Mock 동작 설정
    jest.spyOn(projectRepo, 'findManyByUserId').mockResolvedValue(mockProjects)

    // 실행
    const result = await usecase.exec(dto, mockUser)

    // 검증
    expect(projectRepo.findManyByUserId).toHaveBeenCalledWith({
      userId: mockUser.id,
      offset,
      limit,
    })

    // 응답 확인
    expect(result).toHaveProperty('projects')
    expect(result.projects).toHaveLength(mockProjects.length)
    expect(result.projects[0].id).toBe(mockProjects[0].id)
    expect(result.projects[0].name).toBe(mockProjects[0].name)
    expect(result.projects[1].id).toBe(mockProjects[1].id)
    expect(result.projects[1].name).toBe(mockProjects[1].name)
    expect(result.projects[2].id).toBe(mockProjects[2].id)
    expect(result.projects[2].name).toBe(mockProjects[2].name)
  })

  it('Repository 에러 발생 시 BadGatewayException 발생', async () => {
    // 준비
    const offset = 0
    const limit = 10
    const dto: GetMyProjectListUsecaseDto = { offset, limit }

    // Mock 동작 설정
    jest
      .spyOn(projectRepo, 'findManyByUserId')
      .mockRejectedValue(new Error('Database error'))

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(
      BadGatewayException,
    )
    expect(projectRepo.findManyByUserId).toHaveBeenCalledWith({
      userId: mockUser.id,
      offset,
      limit,
    })
  })

  it('프로젝트가 존재하지 않을 때 NotFoundException 발생', async () => {
    // 준비
    const offset = 0
    const limit = 10
    const dto: GetMyProjectListUsecaseDto = { offset, limit }

    // Mock 동작 설정
    jest.spyOn(projectRepo, 'findManyByUserId').mockResolvedValue(null)

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(NotFoundException)
    expect(projectRepo.findManyByUserId).toHaveBeenCalledWith({
      userId: mockUser.id,
      offset,
      limit,
    })
  })

  it('빈 프로젝트 목록 반환 시 정상 처리되어 빈 배열 반환', async () => {
    // 준비
    const offset = 0
    const limit = 10
    const dto: GetMyProjectListUsecaseDto = { offset, limit }

    // Mock 동작 설정
    jest.spyOn(projectRepo, 'findManyByUserId').mockResolvedValue([])

    // 실행
    const result = await usecase.exec(dto, mockUser)

    // 검증
    expect(projectRepo.findManyByUserId).toHaveBeenCalledWith({
      userId: mockUser.id,
      offset,
      limit,
    })

    // 응답 확인
    expect(result).toHaveProperty('projects')
    expect(result.projects).toHaveLength(0)
  })
})
