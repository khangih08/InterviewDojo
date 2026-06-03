# 📐 Kiến Trúc Hệ Thống & Luồng Dữ Liệu (Architecture & Data Flow)

Tài liệu này cung cấp cái nhìn chuyên sâu về kiến trúc hệ thống của **InterviewDojo**, cách các dịch vụ tương tác với nhau và luồng dữ liệu của 4 công nghệ cốt lõi: **AI Interview Engine**, **RAG Question Bank**, **Coding Sandbox**, và **Webcam Vision Tracking**.

---

## 🏗️ 1. Tổng Quan Kiến Trúc (High-Level Architecture)

InterviewDojo được thiết kế theo mô hình **Client-Server** hiện đại, kết hợp cơ sở dữ liệu quan hệ truyền thống và cơ sở dữ liệu Vector chuyên dụng cho AI:

```
                    ┌────────────────────────┐
                    │  Frontend (Next.js 16) │
                    └───────────┬────────────┘
                                │
                    (REST APIs / WebSockets)
                                │
                                ▼
                    ┌────────────────────────┐
                    │   Backend (NestJS 11)  │
                    └────┬──────────────┬────┘
                         │              │
        (SQL Queries)    │              │   (Semantic Search / Vector Embeddings)
                         ▼              ▼
           ┌─────────────┴──┐       ┌───┴───────────────┐
           │ PostgreSQL DB  │       │ Pinecone Vector DB│
           │ (Users, Hist)  │       │ (Questions Bank)  │
           └────────────────┘       └───────────────────┘
```

---

## 🧠 2. Các Module Kỹ Thuật Đột Phá

### 🎙️ A. AI Mock Interview Engine (Động Cơ Phỏng Vấn AI)
Hệ thống phỏng vấn AI sử dụng cơ chế kết hợp đa mô hình (Multi-LLM Gateway) để tối ưu hóa giữa tốc độ phản hồi và chất lượng phân tích:
1. **Groq SDK (Llama 3)**: Sử dụng trong quá trình phỏng vấn động nhờ tốc độ sinh token siêu tốc (gần như tức thời), giúp giảm độ trễ (latency) khi hội thoại với ứng viên.
2. **Google Gemini (Generative AI)**: Sử dụng sau khi kết thúc phiên phỏng vấn để phân tích ngữ cảnh chuyên sâu, chấm điểm chi tiết và xuất báo cáo biểu đồ kỹ năng phức tạp.

#### 🔄 Luồng Dữ Liệu Phỏng Vấn AI:
```
[Ứng viên nói] ──► [Ghi âm Audio] ──► [Speech-to-Text (STT)] ──► [NestJS Backend]
                                                                        │
  ┌─────────────────────────────────────────────────────────────────────┘
  ▼
[Phân tích phản hồi] ──► [Gọi API Groq (Dynamic chat)] ──► [Lưu lịch sử phỏng vấn]
  │
  ▼
[Kết thúc bài thi] ──► [Gọi API Gemini (Đánh giá chuyên sâu)] ──► [Tạo Báo cáo & Lưu DB]
```

---

### 📚 B. Retrieval-Augmented Generation (RAG) Question Bank
Để cá nhân hóa bộ câu hỏi phỏng vấn phù hợp nhất với từng ứng viên, hệ thống tích hợp công nghệ RAG:
- **Dữ liệu nguồn**: Toàn bộ ngân hàng câu hỏi được chia nhỏ (chunking) và chuyển đổi thành dạng Vector Embeddings (mã hóa ngữ nghĩa).
- **Lưu trữ**: Lưu trữ các vector này tại **Pinecone Vector Database**.
- **Truy xuất**: Khi ứng viên tạo đề thi, hệ thống dùng **LangChain** để thực hiện **Semantic Similarity Search** (Truy vấn tương đồng ngữ nghĩa) giữa Hồ sơ ứng viên (Target Role, Cấp độ, Điểm yếu) với cơ sở dữ liệu Pinecone để lấy ra top câu hỏi có độ tương quan cao nhất.

#### 🔄 Luồng Dữ Liệu RAG:
```
[Hồ sơ ứng viên / Yêu cầu] ──► [Mã hóa thành Vector] (Gemini Embedding)
                                       │
                                       ▼
                             [Pinecone Vector DB]
                                       │ (Semantic Match)
                                       ▼
[LangChain Orchestrator] ◄─── [Lấy Top câu hỏi phù hợp nhất]
           │
           ▼
[Tạo bộ đề thi cá nhân hóa] ──► [Gửi về Frontend cho ứng viên]
```

---

### 💻 C. Safe Coding Sandbox (Hộp Cát Thực Thi Mã Nguồn An Toàn)
Trong các câu hỏi thực hành viết code (Coding Questions):
1. Ứng viên viết mã nguồn ngay trong **Monaco Editor** ở Frontend (đầy đủ tính năng autocomplete, highlight như VS Code).
2. Mã nguồn được gửi lên NestJS Backend qua API.
3. Backend sử dụng thư viện **`vm2`** để tạo một máy ảo Node.js Sandbox cô lập. Sandbox này được cấu hình nghiêm ngặt:
   - **Cách ly hoàn toàn**: Cấm truy cập `require`, cấm truy cập hệ thống tệp tin cục bộ (File System), mạng (Network), và các tiến trình hệ điều hành (`process`).
   - **Giới hạn tài nguyên**: Cấu hình thời gian chạy tối đa (Timeout: 2000ms) và giới hạn bộ nhớ để tránh vòng lặp vô hạn (infinite loops) làm treo server.
4. Trả về kết quả stdout/stderr hoặc lỗi bảo mật về frontend.

#### 🔄 Sơ đồ hoạt động Coding Sandbox:
```
[Monaco Editor] ──► [Gửi Code] ──► [NestJS Server]
                                          │
    ┌─────────────────────────────────────┘
    ▼
[Khởi tạo vm2 Sandbox] ──► [Thiết lập rào chắn bảo mật]
                                  │
                                  ▼
                        [Thực thi Code ứng viên]
                                  │
      ┌───────────────────────────┴───────────────────────────┐
      ▼ (Thành công)                                          ▼ (Vi phạm bảo mật / Loop)
[Lấy kết quả console.log]                              [Ném lỗi Timeout / Access Denied]
      │                                                       │
      └───────────────────────────┬───────────────────────────┘
                                  ▼
                       [Gửi kết quả về Frontend]
```

---

### 📷 D. Webcam & Expression Tracking (Theo Dõi Hành Vi & Cảm Xúc)
Để giúp ứng viên cải thiện ngôn ngữ cơ thể và giữ được sự bình tĩnh trong các buổi phỏng vấn căng thẳng:
- **Frontend (Webcam stream)**: Tích hợp **Google MediaPipe Tasks Vision** chạy trực tiếp trên trình duyệt của người dùng. MediaPipe sẽ phân tích dòng video webcam, định vị 468 điểm mốc trên khuôn mặt (Facial Landmarks) để phát hiện trạng thái biểu cảm (Ví dụ: cười, lo lắng, nháy mắt, căng thẳng).
- **Backend**: Hỗ trợ xử lý hậu kỳ và lưu trữ các phân tích cảm xúc này thông qua **`face-api.js`** để đồng bộ với dòng thời gian của phiên phỏng vấn.
- **Kết quả**: Xuất ra biểu đồ độ tự tin/bình tĩnh giúp ứng viên tự nhận thức để điều chỉnh.

---

### 💳 E. Upgrade PRO & VNPay Payment Gateway (Hệ Thống Thanh Toán & Nâng Cấp)
Để cung cấp gói tính năng PRO (không giới hạn lượt phỏng vấn và câu hỏi), hệ thống tích hợp cổng thanh toán **VNPay**:
1. **Frontend**: Người dùng chọn nâng cấp tài khoản, client gửi yêu cầu tạo link thanh toán lên backend.
2. **Backend (VNPay Service)**:
   - Tạo mã giao dịch duy nhất (`vnp_TxnRef`) bám theo ID người dùng và thời gian thực hiện.
   - Ký số dữ liệu bằng thuật toán mã hóa chữ ký **HMAC-SHA512** với chuỗi bí mật bảo mật (`VNP_HASHSECRET`).
   - Tạo và trả về link redirect checkout của VNPay Sandbox / Production.
3. **Mạng lưới xử lý Callback IPN an toàn**:
   - Khi người dùng hoàn tất thanh toán, cổng VNPay gửi yêu cầu callback (IPN) đến webhook của NestJS Backend.
   - **Xác thực chữ ký**: Backend tính toán lại chữ ký HMAC-SHA512 để so khớp với `vnp_SecureHash` nhằm đảm bảo dữ liệu không bị thay đổi trên đường truyền.
   - **Chống trùng lặp (Idempotency) & Khóa Bi Quan (Pessimistic Lock)**: Để loại bỏ race condition khi VNPay gọi IPN và User redirect đồng thời, hoặc VNPay gọi IPN nhiều lần cho cùng một giao dịch, backend thực hiện bọc quy trình nâng cấp trong một **Database Transaction** và sử dụng khóa bi quan (`setLock('pessimistic_write')`) để khóa tạm thời bản ghi User trong cơ sở dữ liệu cho tới khi transaction kết thúc. Nếu giao dịch hợp lệ và chưa được xử lý, backend cập nhật gói lên PRO, cấp phát credits và giải phóng lock.

#### 🔄 Luồng dữ liệu nâng cấp tài khoản qua VNPay:
```
[Client (Upgrade Button)] ──► [Gọi API Create Link] ──► [NestJS Server]
                                                           │
  ┌────────────────────────────────────────────────────────┘
  ▼
[Tạo chữ ký SHA512 & vnp_TxnRef] ──► [Redirect sang cổng VNPay] ──► [Người dùng thanh toán]
                                                                            │
      ┌─────────────────────────────────────────────────────────────────────┘
      ▼
[VNPay Callback IPN] ──► [NestJS Webhook]
                             │
                             ▼
                 [Xác thực Chữ ký SHA512] (Thành công)
                             │
                             ▼
                 [Khởi tạo DB Transaction]
                             │
                             ▼
                 [Pessimistic Write Lock User]
                             │
            ┌────────────────┴────────────────┐
            ▼ (Chưa xử lý)                    ▼ (Đã xử lý trước đó)
  [Nâng cấp PRO & Credits]            [Bỏ qua - Trả về RspCode 00]
            │                                 │
            └────────────────┬────────────────┘
                             ▼
                 [Commit Transaction & Unlock]
                             │
                             ▼
                 [Trả về Response cho VNPay]
```

---

## 🔒 3. Các Biện Pháp Bảo Mật Hệ Thống

Để đảm bảo hệ thống vận hành an toàn trước các cuộc tấn công mạng, InterviewDojo áp dụng:
1. **Sandboxing tối đa**: Cô lập hoàn toàn luồng thực thi code của người dùng.
2. **JWT Dual-Token**: Sử dụng Access Token thời hạn ngắn (15 phút) kết hợp Refresh Token lưu trong HTTP-Only Cookie để chống tấn công XSS và CSRF.
3. **Database Guard**: Sử dụng TypeORM Parameterized Queries chống SQL Injection 100%.
