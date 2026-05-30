import { Module } from '@nestjs/common';
import { RagService } from './rag.service';

@Module({
  providers: [RagService],
  exports: [RagService], // BẮT BUỘC có dòng này
})
export class RagModule {}