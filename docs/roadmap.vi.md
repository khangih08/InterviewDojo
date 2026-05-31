# 🗺️ Lộ Trình Phát Triển Sản Phẩm (Product Roadmap)

Tài liệu này vạch ra tầm nhìn chiến lược và lộ trình phát triển của **InterviewDojo** qua các giai đoạn từ xây dựng nền tảng cốt lõi (MVP) đến nâng cấp AI chuyên sâu và mở rộng sang phân khúc doanh nghiệp.

---

## 🎯 Tầm Nhìn Chiến Lược / Product Vision

> **InterviewDojo** hướng tới mục tiêu trở thành nền tảng số 1 hỗ trợ các ứng viên công nghệ rèn luyện và bứt phá kỹ năng phỏng vấn thông qua Trí tuệ nhân tạo (AI). Dự án không chỉ dừng lại ở việc hỏi và trả lời, mà còn là một trợ lý ảo toàn diện, thấu hiểu điểm yếu của ứng viên, cung cấp môi trường giả lập coding sandbox và rèn luyện phong thái tự tin qua phân tích ngôn ngữ cơ thể.

---

## 🗺️ Các Giai Đoạn Phát Triển (Milestones)

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Giai đoạn 1: MVP & Nền tảng Cốt lõi (Đang hoàn tất)         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ Giai đoạn 2: AI Nâng cao & Trải nghiệm Realtime (Sắp tới)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ Giai đoạn 3: Dojo Arena & Cổng Doanh nghiệp (Dài hạn)       │
  └─────────────────────────────────────────────────────────────┘
```

---

### 🏁 Giai Đoạn 1: Xây Dựng Nền Tảng Cốt Lõi (MVP - Đang Hoàn Tất)
Tập trung xây dựng các tính năng cơ bản, tạo luồng trải nghiệm hoàn chỉnh cho một ứng viên phỏng vấn thử:

- **Hệ thống Phân quyền & Tài khoản**: Hỗ trợ đăng ký, đăng nhập JWT, tích hợp Google OAuth 2.0.
- **Ngân hàng câu hỏi cơ bản**: Tạo ngân hàng câu hỏi phân loại theo các track (Frontend, Backend, PM, SWE) và độ khó.
- **AI Feedback Engine**: Tích hợp Groq API sinh lời thoại nhanh và Gemini API phân tích, chấm điểm, đánh giá chuyên sâu.
- **Coding Sandbox trực tuyến**: Tích hợp Monaco Editor ở frontend và môi trường chạy code cô lập an toàn bằng `vm2` ở backend.
- **Webcam Expression Tracking**: Sử dụng thư viện **Google MediaPipe** để theo dõi và nhận diện biểu cảm nét mặt của ứng viên thời gian thực.
- **Thống kê & Lịch sử**: Trực quan hóa tiến độ bằng biểu đồ **Recharts**, lưu streak luyện tập hàng ngày.

---

### 🚀 Giai Đoạn 2: Tối Ưu Trải Nghiệm & Trí Tuệ Nhân Tạo Nâng Cao (Sắp Tới)
Mục tiêu là làm cho AI thông minh hơn, giao diện mượt mà và cá nhân hóa sâu sắc hơn:

- **Nâng cấp công nghệ RAG (Retrieval-Augmented Generation)**:
  - Áp dụng **Hybrid Search** (kết hợp tìm kiếm tương đồng vector bằng Pinecone và tìm kiếm từ khóa BM25 truyền thống) để truy xuất câu hỏi phỏng vấn chính xác tuyệt đối.
  - Tự động phân tách hồ sơ CV của ứng viên (PDF parse) tải lên và nhúng (embedding) vào hệ thống để AI tự động soạn bộ câu hỏi bám sát kinh nghiệm thực tế trong CV.
- **Speech-to-Text Realtime**:
  - Tích hợp Whisper API hoặc Web Speech API để chuyển giọng nói thành văn bản ngay lập tức khi ứng viên đang nói, hiển thị phụ đề trực quan (Live Captions).
- **AI Code Copilot thu nhỏ**:
  - Nâng cấp Monaco Editor tích hợp gợi ý hoàn thành code tự động bằng AI (AI Auto-completion) khi ứng viên gặp khó khăn trong quá trình giải bài tập coding.
- **Phân tích hành vi phi ngôn ngữ chuyên sâu**:
  - Phân tích thêm tốc độ nói, khoảng lặng ngập ngừng (hesitations) và âm sắc giọng nói để đưa ra lời khuyên thuyết trình toàn diện nhất.

---

### 🏢 Giai Đoạn 3: Đấu Trường Trực Tuyến & Cổng Tuyển Dụng Doanh Nghiệp (Dài Hạn)
Mở rộng sản phẩm hướng tới cộng đồng lập trình viên và cung cấp giải pháp lọc ứng viên cho các doanh nghiệp:

- **Dojo Arena (Đấu Trường Thách Đấu)**:
  - Cho phép 2 hoặc nhiều ứng viên cùng tham gia vào một phòng phỏng vấn ảo, giải các thử thách coding real-time (LeetCode Style) thi đấu đối kháng trực tiếp sử dụng WebSockets.
- **Cổng Doanh Nghiệp (Enterprise Recruitment Portal)**:
  - Cung cấp trang quản trị riêng cho các nhà tuyển dụng doanh nghiệp.
  - Cho phép nhà tuyển dụng tự tạo đề thi mẫu, gửi link khảo sát phỏng vấn thử cho các ứng viên ứng tuyển.
  - Nhận báo cáo đánh giá tự động từ AI về kỹ năng cứng và thái độ của ứng viên, giúp doanh nghiệp tiết kiệm 80% thời gian lọc hồ sơ vòng đầu.
- **Tích hợp phỏng vấn System Design**:
  - Hỗ trợ bảng vẽ trực tuyến (Whiteboard như Miro/Excalidraw) để ứng viên có thể vẽ sơ đồ kiến trúc hệ thống và giải thích giải pháp thiết kế cho AI đánh giá trực quan.
