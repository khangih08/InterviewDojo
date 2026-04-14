import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        
    forbidNonWhitelisted: true, 
    transform: true,    
    transformOptions : {
      enableImplicitConversion: true,
    },    
  }));

  // CORS - Thêm origin của Render nếu cần
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3001', 
      'http://localhost:3000',
      'https://interview-dojo-smoky.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API documentation related endpoints')
    .setVersion('1.0')
    .addTag('auth', 'Authentication related endpoints')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', in: 'header' }, 'JWT-auth')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Refresh-JWT', in: 'header' }, 'JWT-refresh')
    // Để trống server hoặc dùng biến môi trường để Swagger tự nhận diện URL
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'API Documentation',
  });

  // SỬA LỖI Ở ĐÂY:
  // Render cung cấp cổng qua process.env.PORT. Nếu không có (local) thì dùng 8000.
  // '0.0.0.0' là bắt buộc để Render có thể nhận diện service.
  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on port: ${port}`);
}
bootstrap();