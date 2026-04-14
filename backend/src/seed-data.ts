import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Question } from './entities/question.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryRepo = app.get<Repository<Category>>(getRepositoryToken(Category));
  const questionRepo = app.get<Repository<Question>>(getRepositoryToken(Question));
  const tagRepo = app.get<Repository<Tag>>(getRepositoryToken(Tag));

  console.log('🧹 Bước 1: Đang dọn dẹp sạch bóng dữ liệu cũ...');
  try {
    await questionRepo.query('DELETE FROM "tag_relations"');


    await questionRepo.createQueryBuilder().delete().from(Question).execute();
    await tagRepo.createQueryBuilder().delete().from(Tag).execute();
    await categoryRepo.createQueryBuilder().delete().from(Category).execute();

  } catch (err) {
    console.log('⚠️ Thông báo: Hệ thống đang làm sạch hoặc bảng đã trống.');
  }

  console.log('🚀 Bước 2: Đang đọc file dữ liệu...');

  const fileName = 'dataquestion.json';
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Lỗi: Không tìm thấy file ${fileName} tại thư mục gốc!`);
    await app.close();
    return;
  }

  const questionsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📦 Tìm thấy ${questionsData.length} câu hỏi. Đang bắt đầu nạp...`);

  const categoriesMap = new Map();

  const findCategory = (text: string): string => {
    const t = text.toUpperCase();
    if (t.includes('HTML')) return 'HTML';
    if (t.includes('CSS') || t.includes('SASS')) return 'CSS';
    if (t.includes('REACT')) return 'ReactJS';
    if (t.includes('NODE')) return 'NodeJS';
    if (t.includes('JAVASCRIPT') || t.includes(' JS ')) return 'Javascript';
    if (t.includes('TYPESCRIPT') || t.includes(' TS ')) return 'TypeScript';
    return 'Tổng hợp IT';
  };

  let successCount = 0;

  for (const item of questionsData) {
    try {
      const catName = findCategory(item.question);

      if (!categoriesMap.has(catName)) {
        let cat = await categoryRepo.findOne({ where: { name: catName } });
        if (!cat) cat = await categoryRepo.save({ name: catName });
        categoriesMap.set(catName, cat);
      }

      const category = categoriesMap.get(catName);

      let level = 1;
      if (item.difficulty === 'Trung Bình') level = 2;
      else if (item.difficulty === 'Nâng Cao') level = 3;

      await questionRepo.save({
        content: item.question,
        sampleAnswer: item.answer_text || 'Chưa có đáp án mẫu',
        difficultyLevel: level,
        category: category,
      });

      successCount++;
      if (successCount % 100 === 0) {
        console.log(`⏳ Đã nạp thành công ${successCount} câu...`);
      }
    } catch (error: any) {
      console.error(`❌ Lỗi ở câu: ${item.question.substring(0, 30)}...`, error.message);
    }
  }

  console.log(`\n🎉 Done`);
  console.log(`✅ Đã nạp: ${successCount}/${questionsData.length} câu hỏi mới.`);
  console.log(`📁 Các Tab đã tạo: ${Array.from(categoriesMap.keys()).join(', ')}`);

  await app.close();
}

bootstrap();