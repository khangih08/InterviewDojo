import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('Interview Dojo API')
  .setDescription('The Interview Dojo API documentation')
  .setVersion('1.0')
  .addBearerAuth() 
  .build();