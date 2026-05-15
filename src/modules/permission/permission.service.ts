import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysPermission } from './entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(SysPermission)
    private readonly permRepo: Repository<SysPermission>,
  ) {}

  async getTree() {
    const all = await this.permRepo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
    return this.buildTree(all);
  }

  async findAll() {
    return this.permRepo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findOne(id: number) {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('权限不存在');
    return perm;
  }

  async create(dto: CreatePermissionDto) {
    const existing = await this.permRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('权限编码已存在');

    return this.permRepo.save(this.permRepo.create(dto));
  }

  async update(id: number, dto: UpdatePermissionDto) {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('权限不存在');

    Object.assign(perm, dto);
    return this.permRepo.save(perm);
  }

  async remove(id: number) {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('权限不存在');

    // 检查是否有子权限
    const children = await this.permRepo.find({ where: { parentId: id } });
    if (children.length > 0) {
      throw new ConflictException('存在子权限，不能删除');
    }

    await this.permRepo.remove(perm);
    return { message: '删除成功' };
  }

  private buildTree(items: SysPermission[], parentId = 0): any[] {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }));
  }
}
