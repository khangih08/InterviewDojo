import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './entities/category.entity';
import { Question } from './entities/question.entity';
import { Tag } from './entities/tag.entity';
import { TagRelation } from './entities/tag_relation.entity';
import { User } from './entities/user.entity';
import { QuestionsModule } from './questions/questions.module';
import { TagsModule } from './tag/tags.module';
import { MulterModule } from '@nestjs/platform-express';
import { InterviewsController } from './interviews/controller';
import { InterviewsService } from './interviews/service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    CategoriesModule,
    TagsModule,
    QuestionsModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Category, Tag, TagRelation, Question],
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController,InterviewsController],
  providers: [AppService,InterviewsService],
})
export class AppModule {}
