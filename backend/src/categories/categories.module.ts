import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Category } from 'src/entities/category.entity';
import { CategoriesService } from './categories.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([Category]) 
    ],
  controllers: [CategoriesController],
  providers: [ CategoriesService ],
  exports: [ CategoriesService ],
})
export class CategoriesModule {}
