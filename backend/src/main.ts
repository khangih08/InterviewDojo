import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, 
  });

  const config = new DocumentBuilder()
    .setTitle('InterviewDojo API Documents') 
    .setDescription(
      'Tài liệu API chi tiết cho hệ thống Đánh giá & Phỏng vấn giả lập Mock Interview sử dụng AI.\n\n' +
      '### Các nhóm chức năng chính:\n' +
      '- **Auth**: Quản lý đăng ký, đăng nhập, phân quyền, session.\n' +
      '- **Interviews & AI**: Xử lý tạo phòng phỏng vấn, nộp CV và tương tác chat trực tiếp với AI.\n' +
      '- **Questions & Categories**: Quản lý ngân hàng câu hỏi, danh mục công nghệ và tag.\n' +
      '- **Payment**: Tích hợp cổng thanh toán (VNPay Sandbox) nạp lượt phỏng vấn.\n' +
      '- **Admin**: Quản trị dữ liệu hệ thống.'
    )
    .setVersion('1.0') 
    .addBearerAuth( 
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập Access Token vào đây để gọi các API yêu cầu xác thực',
        in: 'header',
      },
      'JWT-auth', 
    )
    .build();

  // 4. Tạo tài liệu và thiết lập đường dẫn truy cập cho Swagger UI
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ lại token sau khi F5 lại trang Swagger
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend NestJS đã khởi động thành công tại: http://localhost:${port}`);
  console.log(`👉 Bạn có thể gọi API tới: http://localhost:${port}/interviews`);
  console.log(`📝 Xem tài liệu API Swagger tại: http://localhost:${port}/api/docs`); 
}
bootstrap();