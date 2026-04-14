import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { QuestionsModule } from './questions/questions.module';
import { TagsModule } from './tag/tags.module';

import { Category } from './entities/category.entity';
import { Question } from './entities/question.entity';
import { Tag } from './entities/tag.entity';
import { TagRelation } from './entities/tag_relation.entity';
import { User } from './entities/user.entity';

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

    TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const dbUrl = configService.get<string>('DATABASE_URL');
    console.log('Connecting to:', dbUrl); 

    return {
      type: 'postgres',
      url: dbUrl,
      ssl: false,
      extra: {
        ssl: false, 
      },
      entities: [User, Category, Tag, TagRelation, Question],
      synchronize: true,
      logging: true,
    };
  },
}),
  ],
  controllers: [AppController, InterviewsController],
  providers: [AppService, InterviewsService],
})
export class AppModule {}