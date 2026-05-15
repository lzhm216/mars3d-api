import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto/create-bookmark.dto';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('书签管理')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  @ApiOperation({ summary: '书签列表' })
  findAll(@Query() query: PageQueryDto & { userId?: number }) {
    return this.bookmarkService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: '获取当前用户的书签' })
  getMy(@CurrentUser('id') userId: number) {
    return this.bookmarkService.getMyBookmarks(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '书签详情' })
  findOne(@Param('id') id: number) {
    return this.bookmarkService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: '创建书签' })
  create(@Body() dto: CreateBookmarkDto, @CurrentUser('id') userId: number) {
    return this.bookmarkService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新书签' })
  update(@Param('id') id: number, @Body() dto: UpdateBookmarkDto) {
    return this.bookmarkService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除书签' })
  remove(@Param('id') id: number) {
    return this.bookmarkService.remove(+id);
  }
}
