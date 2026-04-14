import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import các entity (nhớ kiểm tra lại đường dẫn import nếu IDE báo đỏ nhé)
import { Question } from './entities/question.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { TagRelation } from './entities/tag_relation.entity'; // Phải có thêm cái này

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Lấy các Repository
  const categoryRepo = app.get<Repository<Category>>(getRepositoryToken(Category));
  const tagRepo = app.get<Repository<Tag>>(getRepositoryToken(Tag));
  const questionRepo = app.get<Repository<Question>>(getRepositoryToken(Question));
  const tagRelationRepo = app.get<Repository<TagRelation>>(getRepositoryToken(TagRelation));

  console.log('🚀 Đang bắt đầu Seeding dữ liệu...');

  // Tạo Categories
  const catBackend = await categoryRepo.save({ name: 'Backend' });
  const catSystem = await categoryRepo.save({ name: 'System Design' });

  // Tạo Tags
  const tagNode = await tagRepo.save({ name: 'NodeJS' });
  const tagDB = await tagRepo.save({ name: 'Database' });
  const tagArch = await tagRepo.save({ name: 'Architecture' });

  // Dữ liệu mẫu đã được sửa lại kiểu dữ liệu
  const seedQuestions = [
    {
      content: 'Giải thích sự khác nhau giữa SQL và NoSQL, khi nào nên chọn mỗi loại?',
      sampleAnswer: 'SQL là CSDL quan hệ, có schema chặt chẽ. NoSQL linh hoạt, dễ scale ngang.',
      difficultyLevel: 2, // Sửa thành SỐ (Giả sử 2 là Medium)
      category: catSystem,
      targetTags: [tagDB, tagArch] // Đổi tên biến tạm để code không nhầm với cột trong Entity
    },
    {
      content: 'Event Loop trong NodeJS hoạt động như thế nào?',
      sampleAnswer: 'Event loop là cơ chế giúp Node.js thực hiện các thao tác I/O không đồng bộ.',
      difficultyLevel: 3, // Sửa thành SỐ (Giả sử 3 là Hard)
      category: catBackend,
      targetTags: [tagNode]
    },
  ];

  for (const item of seedQuestions) {
    // Bước 1: Lưu câu hỏi vào bảng questions trước
    const savedQuestion = await questionRepo.save({
      content: item.content,
      sampleAnswer: item.sampleAnswer,
      difficultyLevel: item.difficultyLevel,
      category: item.category
    });

    // Bước 2: Lưu các tag liên quan vào bảng tag_relations
    for (const tag of item.targetTags) {
      await tagRelationRepo.save({
        question: savedQuestion, // Hoặc question_id: savedQuestion.id (tùy Entity của bạn)
        tag: tag                 // Hoặc tag_id: tag.id
      });
    }
  }

  console.log('✅ Seeding thành công! Đã nạp dữ liệu vào Database.');
  await app.close();
}

bootstrap();