import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { RagService } from "../../rag/rag.service";

/**
 * SỬA: Thêm tham số interviewId vào hàm factory
 */
export const createSearchCVTool = (
  ragService: RagService,
  userId: string,
  interviewId: string // <--- THÊM THAM SỐ NÀY
) => {
  return new DynamicStructuredTool({
    name: "search_cv",
    description: "Chỉ sử dụng công cụ này khi cần xác minh thông tin chi tiết, dự án cụ thể hoặc các kỹ năng chuyên sâu được đề cập trong CV của ứng viên.",
    schema: z.object({
      query: z.string().describe("Từ khóa hoặc câu hỏi cần tìm trong CV, ví dụ: 'Kỹ năng AWS', 'Dự án Fintech'"),
    }),
    func: async ({ query }) => {
      // SỬA: Truyền cả userId và interviewId vào hàm search của ragService
      const searchResults = await ragService.search(query, 'interviews', {
        userId,
        interviewId // <--- TRUYỀN VÀO ĐỂ LỌC CHÍNH XÁC
      });

      if (searchResults.length === 0) {
        return "Không tìm thấy thông tin bổ sung nào trong CV cho yêu cầu này.";
      }

      // Trả về dữ liệu thô (các chunks) để Agent tự tổng hợp thông tin trả lời user
      return searchResults.map(doc => doc.pageContent).join('\n---\n');
    },
  });
};