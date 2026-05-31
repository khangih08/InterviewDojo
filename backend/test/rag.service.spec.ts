/// <reference types="jest" />

const mockUpsert = jest.fn();
const mockQuery = jest.fn();

const mockNamespace = jest.fn().mockImplementation(() => {
  return {
    upsert: mockUpsert,
    query: mockQuery,
  };
});

const mockIndex = jest.fn().mockImplementation(() => {
  return {
    namespace: mockNamespace,
  };
});

jest.mock('@pinecone-database/pinecone', () => {
  return {
    Pinecone: jest.fn().mockImplementation(() => {
      return {
        Index: mockIndex,
      };
    }),
  };
});

const mockEmbedDocuments = jest.fn();
const mockEmbedQuery = jest.fn();

jest.mock('@langchain/community/embeddings/hf', () => {
  return {
    HuggingFaceInferenceEmbeddings: jest.fn().mockImplementation(() => {
      return {
        embedDocuments: mockEmbedDocuments,
        embedQuery: mockEmbedQuery,
      };
    }),
  };
});

import { RagService } from '../src/rag/rag.service';

describe('RagService', () => {
  let service: RagService;

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new RagService();
    await service.onModuleInit();
  });

  describe('indexCv', () => {
    it('should split text, generate embeddings, and upsert records to Pinecone', async () => {
      const cvText = 'Nội dung CV cực kỳ dài và chi tiết của ứng viên.';
      mockEmbedDocuments.mockResolvedValue([
        [0.1, 0.2, 0.3], // embedding chunk 1
      ]);
      mockUpsert.mockResolvedValue({ upsertedCount: 1 });

      const result = await service.indexCv('u-1', 'i-1', cvText);

      expect(result).toBe(true);
      expect(mockEmbedDocuments).toHaveBeenCalled();
      expect(mockIndex).toHaveBeenCalled();
      expect(mockNamespace).toHaveBeenCalledWith('interviews');
      expect(mockUpsert).toHaveBeenCalledWith({
        records: [
          {
            id: expect.stringContaining('chunk-i-1-'),
            values: [0.1, 0.2, 0.3],
            metadata: {
              text: cvText,
              userId: 'u-1',
              interviewId: 'i-1',
              source: 'cv',
            },
          },
        ],
      });
    });

    it('should throw error when HuggingFace fails to generate embeddings', async () => {
      const cvText = 'Nội dung CV...';
      mockEmbedDocuments.mockResolvedValue([]); // empty embeddings

      await expect(service.indexCv('u-1', 'i-1', cvText)).rejects.toThrow(
        'HuggingFace không trả về dữ liệu nhúng.',
      );
    });

    it('should warn and return false if chunks cannot be split', async () => {
      const result = await service.indexCv('u-1', 'i-1', '');
      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    it('should search in Pinecone and return matched results with metadata', async () => {
      mockEmbedQuery.mockResolvedValue([0.1, 0.2, 0.3]);
      const mockMatches = {
        matches: [
          {
            id: 'chunk-1',
            score: 0.9,
            metadata: { text: 'Matched text chunk content' },
          },
        ],
      };
      mockQuery.mockResolvedValue(mockMatches);

      const result = await service.search('Tìm kiếm kỹ năng', 'interviews', {
        userId: 'u-1',
        interviewId: 'i-1',
      });

      expect(result).toEqual([
        {
          pageContent: 'Matched text chunk content',
          metadata: { text: 'Matched text chunk content' },
        },
      ]);
      expect(mockEmbedQuery).toHaveBeenCalledWith('Tìm kiếm kỹ năng');
      expect(mockQuery).toHaveBeenCalledWith({
        vector: [0.1, 0.2, 0.3],
        topK: 3,
        filter: {
          $and: [
            { userId: { $eq: 'u-1' } },
            { interviewId: { $eq: 'i-1' } },
          ],
        },
        includeMetadata: true,
      });
    });

    it('should return empty array if query search fails or returns no matches', async () => {
      mockEmbedQuery.mockRejectedValue(new Error('Search API Error'));

      const result = await service.search('Tìm kiếm', 'interviews', {
        userId: 'u-1',
        interviewId: 'i-1',
      });

      expect(result).toEqual([]);
    });
  });
});
