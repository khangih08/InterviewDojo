import { Module } from '@nestjs/common';
import { TagController } from './tags.controller';
import { TagService } from './tags.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Tag } from 'src/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]) 
  ],
  controllers: [TagController],
  providers: [ TagService ]
})
export class TagsModule {}
