import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS chi tiết để Frontend gọi API không bị chặn
  app.enableCors({
    origin: '*', // Cho phép mọi domain gọi tới (Dùng cho môi trường Dev)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Hỗ trợ gửi cookie/token nếu sau này bạn cần
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend NestJS đã khởi động thành công tại: http://localhost:${port}`);
  console.log(`👉 Bạn có thể gọi API tới: http://localhost:${port}/interviews`);
}
bootstrap();