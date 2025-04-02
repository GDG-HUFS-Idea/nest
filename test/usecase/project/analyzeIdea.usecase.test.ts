import { Test, TestingModule } from '@nestjs/testing'
import { AnalyzeIdeaUsecase } from 'src/usecase/project/analyzeIdea.usecase'
import { AI_SERVICE, AiServicePort } from 'src/port/out/service/ai.service.port'
import { BadGatewayException, BadRequestException } from '@nestjs/common'
import { AnalyzeIdeaUsecaseDto } from 'src/adapter/app/dto/project/analyzeIdea.usecase.dto'
import { UserPermission } from 'src/shared/enum/enum'
import { AnalyzeIdeaDto } from 'src/adapter/ai/dto/analyzeIdea.dto'

describe('AnalyzeIdeaUsecase', () => {
  let usecase: AnalyzeIdeaUsecase
  let aiService: AiServicePort

  beforeEach(async () => {
    const mockAiService: AiServicePort = {
      analyzeIdea: jest.fn(),
      watchAnalysisStatus: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzeIdeaUsecase,
        {
          provide: AI_SERVICE,
          useValue: mockAiService,
        },
      ],
    }).compile()

    usecase = module.get<AnalyzeIdeaUsecase>(AnalyzeIdeaUsecase)
    aiService = module.get<AiServicePort>(AI_SERVICE)
  })

  it('아이디어 분석 요청 성공 시 태스크 ID 반환', async () => {
    // 준비
    const mockTaskId = 'task-123456'
    const mockUser: User = {
      id: 1,
      permissions: [UserPermission.GENERAL],
    }

    const dto: AnalyzeIdeaUsecaseDto = {
      problem: '문제 설명',
      motivation: '동기 설명',
      features: '기능 설명',
      method: '방법 설명',
      deliverable: '결과물 설명',
    }

    const mockAiResponse: AnalyzeIdeaDto = {
      task_id: mockTaskId,
    }

    jest.spyOn(aiService, 'analyzeIdea').mockResolvedValue({
      is_success: true,
      data: mockAiResponse,
    })

    // 실행
    const result = await usecase.exec(dto, mockUser)

    // 검증
    expect(aiService.analyzeIdea).toHaveBeenCalledWith({
      problem: dto.problem,
      motivation: dto.motivation,
      features: dto.features,
      method: dto.method,
      deliverable: dto.deliverable,
    })

    expect(result).toEqual({
      task_id: mockTaskId,
    })
  })

  it('AI 서비스에서 400 에러 발생 시 BadRequestException 발생', async () => {
    // 준비
    const mockUser: User = {
      id: 1,
      permissions: [UserPermission.GENERAL],
    }

    const dto: AnalyzeIdeaUsecaseDto = {
      problem: '문제 설명',
      motivation: '동기 설명',
      features: '기능 설명',
      method: '방법 설명',
      deliverable: '결과물 설명',
    }

    jest.spyOn(aiService, 'analyzeIdea').mockResolvedValue({
      is_success: false,
      status: 400,
      code: 1001,
    })

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(
      BadRequestException,
    )
    expect(aiService.analyzeIdea).toHaveBeenCalledWith({
      problem: dto.problem,
      motivation: dto.motivation,
      features: dto.features,
      method: dto.method,
      deliverable: dto.deliverable,
    })
  })

  it('AI 서비스에서 500 에러 발생 시 BadGatewayException 발생', async () => {
    // 준비
    const mockUser: User = {
      id: 1,
      permissions: [UserPermission.GENERAL],
    }

    const dto: AnalyzeIdeaUsecaseDto = {
      problem: '문제 설명',
      motivation: '동기 설명',
      features: '기능 설명',
      method: '방법 설명',
      deliverable: '결과물 설명',
    }

    jest.spyOn(aiService, 'analyzeIdea').mockResolvedValue({
      is_success: false,
      status: 500,
      code: 2001,
    })

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(
      BadGatewayException,
    )
    expect(aiService.analyzeIdea).toHaveBeenCalledWith({
      problem: dto.problem,
      motivation: dto.motivation,
      features: dto.features,
      method: dto.method,
      deliverable: dto.deliverable,
    })
  })

  it('AI 서비스 호출 중 네트워크 오류 발생 시 BadGatewayException 발생', async () => {
    // 준비
    const mockUser: User = {
      id: 1,
      permissions: [UserPermission.GENERAL],
    }

    const dto: AnalyzeIdeaUsecaseDto = {
      problem: '문제 설명',
      motivation: '동기 설명',
      features: '기능 설명',
      method: '방법 설명',
      deliverable: '결과물 설명',
    }

    jest
      .spyOn(aiService, 'analyzeIdea')
      .mockRejectedValue(new Error('Network error'))

    // 실행 및 검증
    await expect(usecase.exec(dto, mockUser)).rejects.toThrow(
      BadGatewayException,
    )
    expect(aiService.analyzeIdea).toHaveBeenCalledWith({
      problem: dto.problem,
      motivation: dto.motivation,
      features: dto.features,
      method: dto.method,
      deliverable: dto.deliverable,
    })
  })
})
