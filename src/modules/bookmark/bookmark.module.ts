import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { MapBookmark } from './entities/bookmark.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapBookmark])],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService],
})
export class BookmarkModule {}
