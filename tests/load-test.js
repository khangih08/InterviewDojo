import http from 'k6/http';
import { sleep, check } from 'k6';

// Cấu hình kiểm thử tải
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Tăng dần từ 0 lên 20 Virtual Users (VU) trong 30 giây
    { duration: '1m', target: 20 },  // Giữ tải ổn định ở mức 20 VU trong 1 phút
    { duration: '15s', target: 0 },  // Giảm tải dần từ 20 VU về 0 trong 15 giây
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // Tỉ lệ request lỗi phải nhỏ hơn 1%
    http_req_duration: ['p(95)<500'], // 95% request phải có phản hồi dưới 500ms
  },
};

export default function () {
  const BASE_URL = 'http://localhost:8000';
  
  // 1. Giả lập đăng nhập
  const loginPayload = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);

  const loginPassed = check(loginRes, {
    'đăng nhập thành công (status 200/201)': (r) => r.status === 200 || r.status === 201,
    'có access token': (r) => {
      try {
        return JSON.parse(r.body).accessToken !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (loginPassed) {
    const token = JSON.parse(loginRes.body).accessToken;
    const authParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    // 2. Giả lập xem danh sách câu hỏi
    const questionsRes = http.get(`${BASE_URL}/questions`, authParams);
    check(questionsRes, {
      'lấy danh sách câu hỏi thành công (status 200)': (r) => r.status === 200,
    });

    // 3. Giả lập xem lịch sử phỏng vấn
    const interviewsRes = http.get(`${BASE_URL}/interviews`, authParams);
    check(interviewsRes, {
      'lấy lịch sử phỏng vấn thành công (status 200)': (r) => r.status === 200,
    });
  }

  // Nghỉ 1 giây giữa các vòng lặp của mỗi Virtual User
  sleep(1);
}
