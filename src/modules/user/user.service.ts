import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SysUser } from './entities/user.entity';
import { SysRole } from '../role/entities/role.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PageQueryDto, PageResult } from '../../common/dto/page-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(SysUser)
    private readonly userRepo: Repository<SysUser>,
    @InjectRepository(SysRole)
    private readonly roleRepo: Repository<SysRole>,
  ) {}

  async findAll(query: PageQueryDto & { keyword?: string; status?: number }) {
    const { page = 1, pageSize = 20, keyword, status } = query;
    const qb = this.userRepo.createQueryBuilder('user');

    if (keyword) {
      qb.where('user.username LIKE :kw OR user.nickname LIKE :kw', {
        kw: `%${keyword}%`,
      });
    }
    if (status !== undefined) {
      qb.andWhere('user.status = :status', { status });
    }

    qb.orderBy('user.id', 'ASC');
    qb.skip((page - 1) * pageSize).take(pageSize);
    qb.leftJoinAndSelect('user.roles', 'roles');

    const [list, total] = await qb.getManyAndCount();
    // 排除密码字段
    const safeList = list.map(({ password, ...rest }) => rest);
    return new PageResult(safeList, total, page, pageSize);
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('用户不存在');
    const { password, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('用户名已存在');

    const user = this.userRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
    });
    const saved = await this.userRepo.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');

    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    await this.userRepo.remove(user);
    return { message: '删除成功' };
  }

  async toggleStatus(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    user.status = user.status === 1 ? 0 : 1;
    await this.userRepo.save(user);
    return { id: user.id, status: user.status };
  }

  async assignRoles(userId: number, roleIds: number[]) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('用户不存在');

    const roles = await this.roleRepo.findByIds(roleIds);
    user.roles = roles;
    await this.userRepo.save(user);
    return { message: '角色分配成功' };
  }
}
