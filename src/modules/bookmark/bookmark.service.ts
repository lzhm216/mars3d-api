import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapBookmark } from './entities/bookmark.entity';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto/create-bookmark.dto';
import { PageQueryDto, PageResult } from '../../common/dto/page-query.dto';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(MapBookmark)
    private readonly bookmarkRepo: Repository<MapBookmark>,
  ) {}

  async findAll(query: PageQueryDto & { userId?: number }) {
    const { page = 1, pageSize = 20, userId } = query;
    const qb = this.bookmarkRepo.createQueryBuilder('bookmark');

    if (userId) {
      qb.where('bookmark.userId = :userId', { userId });
    }

    qb.orderBy('bookmark.id', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();
    return new PageResult(list, total, page, pageSize);
  }

  async findOne(id: number) {
    const bookmark = await this.bookmarkRepo.findOne({ where: { id } });
    if (!bookmark) throw new NotFoundException('书签不存在');
    return bookmark;
  }

  async create(dto: CreateBookmarkDto, userId: number) {
    const bookmark = this.bookmarkRepo.create({ ...dto, userId });
    return this.bookmarkRepo.save(bookmark);
  }

  async update(id: number, dto: UpdateBookmarkDto) {
    const bookmark = await this.bookmarkRepo.findOne({ where: { id } });
    if (!bookmark) throw new NotFoundException('书签不存在');

    Object.assign(bookmark, dto);
    return this.bookmarkRepo.save(bookmark);
  }

  async remove(id: number) {
    const bookmark = await this.bookmarkRepo.findOne({ where: { id } });
    if (!bookmark) throw new NotFoundException('书签不存在');

    await this.bookmarkRepo.remove(bookmark);
    return { message: '删除成功' };
  }

  async getMyBookmarks(userId: number) {
    return this.bookmarkRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
