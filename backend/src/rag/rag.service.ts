import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private pinecone: Pinecone;
  private embeddings: HuggingFaceInferenceEmbeddings;

  constructor() {
    this.embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: (process.env.HF_API_KEY || '').trim(),
      model: 'sentence-transformers/all-MiniLM-L6-v2',
    });
  }

  async onModuleInit() {
    try {
      this.pinecone = new Pinecone({
        apiKey: (process.env.PINECONE_API_KEY || '').trim(),
      });
      this.logger.log('✅ RagService: Kết nối Pinecone thành công');
    } catch (error) {
      this.logger.error(`❌ Lỗi kết nối Pinecone: ${error.message}`);
    }
  }

  /**
   * Đưa CV vào Pinecone kèm theo InterviewId để cô lập dữ liệu
   */
  async indexCv(userId: string, interviewId: string, cvText: string) {
    try {
      this.logger.log(`[RAG] Bắt đầu nạp CV cho User: ${userId} | Phiên phỏng vấn: ${interviewId}`);

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const chunks = await textSplitter.splitText(cvText);

      if (!chunks || chunks.length === 0) {
        this.logger.warn('[RAG] Không thể băm nhỏ nội dung CV.');
        return false;
      }

      this.logger.log(`[RAG] Đã chia thành ${chunks.length} chunks. Đang tạo Embeddings...`);

      const embeddings = await this.embeddings.embedDocuments(chunks);

      if (!embeddings || embeddings.length === 0) {
        throw new Error('HuggingFace không trả về dữ liệu nhúng.');
      }

      // Chuẩn bị records với Metadata chứa interviewId
      const records = chunks.map((chunk, i) => ({
        id: `chunk-${interviewId}-${uuidv4()}`,
        values: embeddings[i],
        metadata: {
          text: chunk,
          userId: String(userId),
          interviewId: String(interviewId), // QUAN TRỌNG: Dùng để filter
          source: 'cv'
        },
      }));

      const indexName = process.env.PINECONE_INDEX || '';
      const index = this.pinecone.Index(indexName);

      // Upsert vào namespace 'interviews'
      // TRẢ LẠI FIX GỐC CỦA BẠN: Bọc mảng records vào object
      await index.namespace('interviews').upsert({
        records: records as any
      } as any);

      this.logger.log(`✅ [RAG] Đã nạp thành công ${records.length} vectors cho phiên: ${interviewId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ [RAG ERROR]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tìm kiếm chính xác trong phạm vi của một InterviewId
   */
  async search(query: string, namespace: string, filter: { userId: string, interviewId: string }) {
    try {
      const indexName = process.env.PINECONE_INDEX || '';
      const index = this.pinecone.Index(indexName);

      const queryVector = await this.embeddings.embedQuery(query);

      // Sử dụng toán tử $and để lọc đúng User và đúng Phiên phỏng vấn hiện tại
      const result = await index.namespace(namespace).query({
        vector: queryVector,
        topK: 3,
        filter: {
          $and: [
            { userId: { $eq: String(filter.userId) } },
            { interviewId: { $eq: String(filter.interviewId) } }
          ]
        },
        includeMetadata: true,
      });

      return result.matches?.map(m => ({
        pageContent: m.metadata?.text as string,
        metadata: m.metadata
      })) || [];
    } catch (error) {
      this.logger.error(`❌ [RAG SEARCH ERROR]: ${error.message}`);
      return [];
    }
  }
}