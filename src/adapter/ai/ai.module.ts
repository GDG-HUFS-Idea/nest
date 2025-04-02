import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiService } from './ai.service'
import { AI_SERVICE } from 'src/port/out/service/ai.service.port'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [{ provide: AI_SERVICE, useClass: AiService }],
  exports: [{ provide: AI_SERVICE, useClass: AiService }],
})
export class AiModule {}
