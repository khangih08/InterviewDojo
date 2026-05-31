# 🎭 Kịch Bản Trình Diễn Hệ Thống (Demo Guide)

Tài liệu này cung cấp một kịch bản trình diễn (Demo Flow) chuyên nghiệp từng bước giúp bạn phô diễn toàn bộ các tính năng cao cấp và đột phá nhất của nền tảng **InterviewDojo** cho khách hàng, đối tác hoặc ban giám khảo.

---

## 🛠️ Chuẩn Bị Trước Khi Demo (Pre-flight Checklist)

1. **Khởi chạy hệ thống**: Đảm bảo database Docker, Backend NestJS và Frontend Next.js đều đang chạy ổn định.
2. **Kiểm tra kết nối mạng & API Keys**: Đảm bảo các API Keys cho **Google Gemini**, **Groq** và **Pinecone** trong tệp `backend/.env` đã hoạt động tốt.
3. **Chuẩn bị phần cứng**: Đảm bảo máy tính của bạn đã bật webcam và microphone, vì hệ thống phỏng vấn tích hợp công nghệ phân tích biểu cảm và ghi âm thực tế.

---

## 🎭 Kịch Bản Trình Diễn Chi Tiết (7 Bước Bứt Phá)

### Bước 1: Ấn Tượng Đầu Tiên (Landing Page & Đăng Ký)
- **Hành động**: Mở trình duyệt và truy cập `http://localhost:3000`.
- **Nội dung phô diễn**:
  - Trình diễn giao diện Landing Page với phong cách **Glassmorphism** sang trọng, hiện đại, các micro-animations chuyển động mượt mà.
  - Nhấp vào nút **Bắt đầu luyện tập** để chuyển tới trang Đăng ký tài khoản (`/register`).
  - Điền thông tin tạo một tài khoản mới và nhấn Đăng ký. Sau đó đăng nhập bằng tài khoản vừa tạo.

---

### Bước 2: Thiết Lập Hồ Sơ Cá Nhân Hóa (Onboarding Flow)
- **Hành động**: Sau khi đăng nhập lần đầu, hệ thống sẽ đưa ứng viên tới luồng Onboarding.
- **Nội dung phô diễn**:
  - Chọn vị trí ứng tuyển mong muốn (Target Role) như: *Frontend Developer*, *Backend Developer*, *Fullstack*, v.v.
  - Chọn cấp độ kỹ năng hiện tại (Junior, Mid, Senior).
  - Giải thích cho người xem: *"Hệ thống AI sẽ dựa vào cấu hình hồ sơ này để cá nhân hóa hoàn toàn bộ câu hỏi phỏng vấn phù hợp riêng cho từng ứng viên."*

---

### Bước 3: Dashboard Trung Tâm & Gợi Ý Hành Động Tiếp Theo
- **Hành động**: Chuyển tới trang Dashboard chính (`http://localhost:3000/dashboard`).
- **Nội dung phô diễn**:
  - Giới thiệu chỉ số **Streak** (chuỗi ngày luyện tập liên tục) để thúc đẩy động lực của ứng viên.
  - Chỉ vào thẻ **Hành động Tiếp theo (Next Action Card)** được gợi ý tự động bởi AI dựa trên lịch sử luyện tập gần nhất.
  - Nhấp vào nút **Bắt Đầu Nhanh (Zap)** để thấy luồng thiết lập bài thi tức thì siêu tốc.

---

### Bước 4: Khám Phá Ngân Hàng Câu Hỏi Tích Hợp RAG
- **Hành động**: Nhấp vào menu **Ngân Hàng Câu Hỏi (Questions)** trên thanh Sidebar.
- **Nội dung phô diễn**:
  - Trình diễn bộ lọc câu hỏi đa dạng (theo độ khó, thẻ kỹ năng, từ khóa tìm kiếm).
  - Giải thích cơ chế kỹ thuật: *"Khi ứng viên tìm kiếm hoặc được AI tạo đề thi, hệ thống sẽ sử dụng công nghệ **RAG (Retrieval-Augmented Generation)** kết hợp với **Pinecone Vector Database** và **LangChain** để truy xuất thông minh các câu hỏi có liên quan nhất với ngữ cảnh hồ sơ của ứng viên."*

---

### Bước 5: Phiên Phỏng Vấn Thử Webcam Tracking & Coding Sandbox (Đỉnh Cao)
- **Hành động**: Bắt đầu một phiên phỏng vấn mới.
- **Nội dung phô diễn**:
  - **Webcam & Microphone Permission**: Cấp quyền camera và micro. Giải thích tính năng **Webcam Expression Tracking** tích hợp **Google MediaPipe** và **`face-api.js`** tự động nhận diện nét mặt (lo lắng, tự tin, bình tĩnh) thời gian thực của ứng viên khi đang trả lời phỏng vấn.
  - **Ghi âm hội thoại**: Nhấp nút ghi âm, nói trực tiếp câu trả lời bằng tiếng Anh hoặc tiếng Việt, sau đó nhấn dừng để AI tự động chuyển giọng nói thành văn bản (Speech-to-Text).
  - **Coding Sandbox**: Đối với các câu hỏi thực hành coding, một trình soạn thảo mã nguồn **Monaco Editor** chuẩn Premium sẽ hiển thị. Viết một đoạn code Javascript mẫu, nhấp **Chạy thử code** để hệ thống gửi yêu cầu lên Backend và thực thi code an toàn bên trong môi trường sandbox cô lập của **`vm2`**, trả về kết quả console ngay tức khắc!

---

### Bước 6: Báo Cáo Phân Tích & Nhận Xét Từ Trí Tuệ Nhân Tạo (AI Evaluation)
- **Hành động**: Hoàn thành phiên phỏng vấn và chuyển tới trang Kết quả (`/result/[id]`).
- **Nội dung phô diễn**:
  - **Điểm số tổng quan**: Điểm số trung bình do AI chấm điểm dựa trên thang điểm 10.
  - **Biểu đồ kỹ năng**: Sử dụng **Recharts** để trực quan hóa biểu đồ kỹ năng (từ vựng, tư duy logic, mức độ tự tin, kiến thức chuyên môn).
  - **Nhận xét chi tiết trên từng câu**: Hiển thị chi tiết từng câu hỏi, câu trả lời thực tế của ứng viên (transcript), câu trả lời gợi ý chuẩn mực và nhận xét mang tính xây dựng từ AI.

---

### Bước 7: Swagger API Docs & Trang Quản Trị Admin
- **Hành động**: Truy cập `http://localhost:3001/api/docs`.
- **Nội dung phô diễn**:
  - Trình diễn bộ tài liệu API tự động Swagger UI chuẩn OpenAPI 3.0 chuyên nghiệp.
  - Phô diễn các endpoints của hệ thống (Auth, Questions, Interviews, RAG...) để khẳng định thiết kế hệ thống vững chắc và bài bản.

---

## ⚡ Xử Lý Sự Cố Nhanh Trong Lúc Demo (Troubleshooting)

- **Trình duyệt không nhận diện webcam/micro**: Hãy đảm bảo bạn đang sử dụng giao thức an toàn `http://localhost:3000` (Chrome cho phép cấp quyền trên localhost). Nếu dùng IP khác, bắt buộc phải cấu hình HTTPS.
- **AI phản hồi chậm**: Nếu API của Groq hoặc Gemini bị nghẽn, hãy giải thích: *"Do hệ thống đang chạy trực tiếp trên các API Cloud toàn cầu nên đôi khi có thể bị ảnh hưởng bởi đường truyền mạng quốc tế."*
- **Database trống trơn**: Hãy chạy lệnh `npm run seed` trong thư mục `backend` để nạp ngay bộ dữ liệu câu hỏi mẫu trong 5 giây trước khi bắt đầu trình diễn.
