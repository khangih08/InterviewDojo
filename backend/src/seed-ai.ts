import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

import { Question } from './entities/question.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { TagRelation } from './entities/tag_relation.entity';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryRepo = app.get<Repository<Category>>(getRepositoryToken(Category));
  const tagRepo = app.get<Repository<Tag>>(getRepositoryToken(Tag));
  const questionRepo = app.get<Repository<Question>>(getRepositoryToken(Question));
  const tagRelationRepo = app.get<Repository<TagRelation>>(getRepositoryToken(TagRelation));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Lỗi: Chưa tìm thấy GEMINI_API_KEY trong file .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Sử dụng gemini-2.5-flash (Bản mới nhất, cực nhanh)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const TOTAL_BATCHES = 6;
  const QUESTIONS_PER_BATCH = 5; // Chia nhỏ để tránh lỗi 429

  console.log(`🚀 Đang dùng Gemini Flash tạo ${TOTAL_BATCHES * QUESTIONS_PER_BATCH} câu hỏi...`);

  for (let batch = 1; batch <= TOTAL_BATCHES; batch++) {
    console.log(`\n⏳ Đợt ${batch}/${TOTAL_BATCHES}: Đang lấy 5 câu hỏi...`);

    const prompt = `
      Hãy tạo một mảng JSON gồm 5 câu hỏi phỏng vấn IT thực tế (Backend, Frontend, System Design).
      Yêu cầu nội dung chuyên sâu, hóc búa.
      Cấu trúc JSON bắt buộc:
      [
        {
          "content": "Câu hỏi...",
          "sampleAnswer": "Câu trả lời...",
          "difficultyLevel": 3,
          "categoryName": "Backend",
          "tags": ["NodeJS", "Security"]
        }
      ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const aiQuestions = JSON.parse(responseText);
      console.log(`✅ Đã nhận ${aiQuestions.length} câu. Đang lưu...`);

      for (const item of aiQuestions) {
        let category = await categoryRepo.findOne({ where: { name: item.categoryName } });
        if (!category) category = await categoryRepo.save({ name: item.categoryName });

        const savedQuestion = await questionRepo.save({
          content: item.content,
          sampleAnswer: item.sampleAnswer,
          difficultyLevel: item.difficultyLevel,
          category: category,
        });

        for (const tagName of item.tags) {
          let tag = await tagRepo.findOne({ where: { name: tagName } });
          if (!tag) tag = await tagRepo.save({ name: tagName });
          await tagRelationRepo.save({ question: savedQuestion, tag: tag });
        }
      }

      // Nghỉ 5 giây giữa các đợt để Google không khóa IP
      await sleep(5000);

    } catch (error: any) {
      console.error(`❌ Lỗi đợt ${batch}:`, error.message);
      if (error.message.includes('429')) {
        console.log('🛑 API đang bị quá tải, code sẽ nghỉ 20s trước khi thử lại...');
        await sleep(20000);
      }
    }
  }

  console.log('\n🎉 Hoàn tất! Check thử DB xem câu hỏi đã lên chưa bạn ơi.');
  await app.close();
}

bootstrap();