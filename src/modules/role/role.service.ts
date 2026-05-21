import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SysRole } from './entities/role.entity';
import { SysRoleLayer } from './entities/role-layer.entity';
import { SysPermission } from '../permission/entities/permission.entity';
import { MapLayer } from '../layer/entities/layer.entity';
import { CreateRoleDto, UpdateRoleDto, AssignLayersDto } from './dto/create-role.dto';
import { PageQueryDto, PageResult } from '../../common/dto/page-query.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(SysRole)
    private readonly roleRepo: Repository<SysRole>,
    @InjectRepository(SysPermission)
    private readonly permRepo: Repository<SysPermission>,
    @InjectRepository(MapLayer)
    private readonly layerRepo: Repository<MapLayer>,
    @InjectRepository(SysRoleLayer)
    private readonly roleLayerRepo: Repository<SysRoleLayer>,
  ) {}

  async findAll(query: PageQueryDto & { keyword?: string }) {
    const { page = 1, pageSize = 20, keyword } = query;
    const qb = this.roleRepo.createQueryBuilder('role');

    if (keyword) {
      qb.where('role.name LIKE :kw OR role.code LIKE :kw', { kw: `%${keyword}%` });
    }

    qb.orderBy('role.id', 'ASC');
    qb.skip((page - 1) * pageSize).take(pageSize);
    qb.leftJoinAndSelect('role.permissions', 'permissions');

    const [list, total] = await qb.getManyAndCount();
    return new PageResult(list, total, page, pageSize);
  }

  async findOne(id: number) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('角色不存在');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.roleRepo.findOne({
      where: [{ name: dto.name }, { code: dto.code }],
    });
    if (existing) throw new ConflictException('角色名称或编码已存在');

    return this.roleRepo.save(this.roleRepo.create(dto));
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在');

    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async remove(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在');
    if (role.code === 'admin') throw new ConflictException('不能删除超级管理员角色');

    await this.roleRepo.remove(role);
    return { message: '删除成功' };
  }

  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('角色不存在');

    role.permissions = await this.permRepo.findBy({ id: In(permissionIds) });
    await this.roleRepo.save(role);
    return { message: '权限分配成功' };
  }

  async assignLayers(roleId: number, dto: AssignLayersDto) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('角色不存在');

    // 空数组直接清空关联并返回
    if (!dto.layers || dto.layers.length === 0) {
      await this.roleLayerRepo.delete({ role: { id: roleId } });
      return { message: '图层权限已清空' };
    }

    // 校验所有 layerId 在 map_layer 表中真实存在，避免 FK 约束报错
    const requestedIds = dto.layers.map(item => item.layerId);
    const existingLayers = await this.layerRepo.find({
      where: { id: In(requestedIds) },
      select: ['id'],
    });
    const existingIds = new Set(existingLayers.map(l => l.id));
    const invalidIds = requestedIds.filter(id => !existingIds.has(id));
    if (invalidIds.length > 0) {
      throw new NotFoundException(`以下图层ID不存在: ${invalidIds.join(', ')}`);
    }

    // 先删除旧的关联
    await this.roleLayerRepo.delete({ role: { id: roleId } });

    // 使用参数化原始 SQL 批量插入，彻底绕过 TypeORM 实体映射层
    // TypeORM 的 save()/insert().values() 对关系对象映射在部分版本中行为不一致
    const params: any[] = [];
    const placeholders = dto.layers.map((item, idx) => {
      const offset = idx * 4;
      params.push(roleId, item.layerId, item.canRead ?? true, item.canEdit ?? false);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    }).join(', ');

    await this.roleLayerRepo.query(
      `INSERT INTO sys_role_layer (role_id, layer_id, can_read, can_edit) VALUES ${placeholders}`,
      params
    );

    return { message: '图层权限分配成功' };
  }

  async getRoleLayers(roleId: number) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('角色不存在');

    // 使用 QueryBuilder 精确控制 JOIN，避免嵌套 relations 加载异常
    const roleLayers = await this.roleLayerRepo.createQueryBuilder('rl')
      .leftJoinAndSelect('rl.layer', 'layer')
      .leftJoinAndSelect('layer.group', 'group')
      .where('rl.role_id = :roleId', { roleId })
      .getMany();

    return roleLayers
      .filter(rl => rl.layer) // 过滤掉 layer 已被删除的孤儿记录
      .map(rl => ({
        layerId: rl.layer.id,
        canRead: rl.canRead,
        canEdit: rl.canEdit,
        name: rl.layer.name,
        type: rl.layer.type,
        groupName: rl.layer.group?.name || '默认分组',
      }));
  }
}
