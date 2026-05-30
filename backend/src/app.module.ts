import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Controllers & Services gốc
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { QuestionsModule } from './questions/questions.module';
import { TagsModule } from './tag/tags.module';
import { RedisModule } from './common/redis/redis.module';
import { AiModule } from './ai/ai.module';

// Entities
import { Category } from './entities/category.entity';
import { Question } from './entities/question.entity';
import { Tag } from './entities/tag.entity';
import { TagRelation } from './entities/tag_relation.entity';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { Interview } from './entities/interview.entity';
import { Message } from './entities/message.entity';

// Interviews
import { InterviewsController } from './interviews/interviews.controller';
import { InterviewsService } from './interviews/interviews.service';

// Admin (Mới thêm vào)
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cấu hình Multer lưu vào memory để xử lý buffer CV
    MulterModule.register({
      storage: memoryStorage(),
    }),

    // Import các Module chức năng
    AuthModule,
    AiModule,
    CategoriesModule,
    TagsModule,
    QuestionsModule,
    RedisModule,

    // Cấu hình TypeORM kết nối Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          url: dbUrl,
          ssl: false,
          extra: {
            ssl: false,
          },
          entities: [
            User,
            Category,
            Tag,
            TagRelation,
            Question,
            Session,
            Interview,
            Message
          ],
          synchronize: true, // Tự động cập nhật schema database (dùng cho Dev/BTL)
          logging: false, // Để false cho đỡ rối terminal khi test, bật true nếu cần debug SQL
        };
      },
    }),

    // Đăng ký Repository để dùng trong Controllers/Services khai báo tại AppModule
    TypeOrmModule.forFeature([User, Interview, Message]),
  ],
  controllers: [
    AppController,
    InterviewsController,
    AdminController // Đã thêm AdminController vào đây
  ],
  providers: [
    AppService,
    InterviewsService
  ],
})
export class AppModule {}