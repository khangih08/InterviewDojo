import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { Repository } from 'typeorm';

describe('Auth Integration Test (Real DB)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let dbAvailable = true;
  const testEmail = 'integration-test@example.com';
  const testPassword = 'Password123!';
  const testFullName = 'Integration Tester';

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
      
      // Chạy một truy vấn nhanh để thử kết nối
      await userRepository.findOne({ where: { email: 'non-existent@test.com' } });
    } catch (error) {
      console.warn('⚠️ [Integration Test] Database not running or unable to connect. Skipping database integration tests.');
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (dbAvailable && userRepository) {
      await userRepository.delete({ email: testEmail });
    }
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    if (dbAvailable && userRepository) {
      await userRepository.delete({ email: testEmail });
    }
  });

  describe('POST /auth/register', () => {
    it('Đăng ký tài khoản mới thành công và ghi nhận vào Database', async () => {
      if (!dbAvailable) {
        console.warn('Test skipped: DB not connected.');
        return;
      }

      const registerPayload = {
        email: testEmail,
        password: testPassword,
        full_name: testFullName,
        target_role: 'Backend Developer',
        experience_level: 'junior',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', testEmail);
      expect(response.body.user).toHaveProperty('full_name', testFullName);

      const userInDb = await userRepository.findOne({ where: { email: testEmail } });
      expect(userInDb).toBeDefined();
      expect(userInDb?.full_name).toBe(testFullName);
    });

    it('Không cho phép đăng ký trùng email', async () => {
      if (!dbAvailable) {
        console.warn('Test skipped: DB not connected.');
        return;
      }

      const registerPayload = {
        email: testEmail,
        password: testPassword,
        full_name: testFullName,
        target_role: 'Backend Developer',
        experience_level: 'junior',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('Đăng nhập thành công với thông tin tài khoản hợp lệ', async () => {
      if (!dbAvailable) {
        console.warn('Test skipped: DB not connected.');
        return;
      }

      const registerPayload = {
        email: testEmail,
        password: testPassword,
        full_name: testFullName,
        target_role: 'Backend Developer',
        experience_level: 'junior',
      };
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(HttpStatus.CREATED);

      const loginPayload = {
        email: testEmail,
        password: testPassword,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testEmail);
    });

    it('Từ chối đăng nhập với sai mật khẩu', async () => {
      if (!dbAvailable) {
        console.warn('Test skipped: DB not connected.');
        return;
      }

      const registerPayload = {
        email: testEmail,
        password: testPassword,
        full_name: testFullName,
        target_role: 'Backend Developer',
        experience_level: 'junior',
      };
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(HttpStatus.CREATED);

      const loginPayload = {
        email: testEmail,
        password: 'WrongPassword123!',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
