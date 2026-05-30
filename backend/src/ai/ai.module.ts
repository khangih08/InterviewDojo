import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { RagModule } from '../rag/rag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { RagService } from '../rag/rag.service';
@Module({
  imports: [
    RagModule, // Kết nối với RagService
    TypeOrmModule.forFeature([User]), // Để lấy target_role, experience_level của User
  ],
  providers: [AiService,RagService],
  exports: [AiService,RagService],
})
export class AiModule {}