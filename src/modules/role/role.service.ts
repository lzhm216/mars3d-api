import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SysRole } from './entities/role.entity';
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
    qb.leftJoinAndSelect('role.layers', 'layers');

    const [list, total] = await qb.getManyAndCount();
    return new PageResult(list, total, page, pageSize);
  }

  async findOne(id: number) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions', 'layers'],
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

    role.permissions = await this.permRepo.findByIds(permissionIds);
    await this.roleRepo.save(role);
    return { message: '权限分配成功' };
  }

  async assignLayers(roleId: number, dto: AssignLayersDto) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['layers'],
    });
    if (!role) throw new NotFoundException('角色不存在');

    // 通过原生查询管理多对多关系中的额外字段
    const manager = this.roleRepo.manager;

    // 先删除旧的关联
    await manager.query('DELETE FROM sys_role_layer WHERE role_id = $1', [roleId]);

    // 插入新的关联
    for (const item of dto.layers) {
      await manager.query(
        'INSERT INTO sys_role_layer (role_id, layer_id, can_read, can_edit) VALUES ($1, $2, $3, $4)',
        [roleId, item.layerId, item.canRead, item.canEdit],
      );
    }

    return { message: '图层权限分配成功' };
  }

  async getRoleLayers(roleId: number) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['layers'],
    });
    if (!role) throw new NotFoundException('角色不存在');

    // 查询关联的权限信息
    const layers = await this.roleRepo.manager.query(
      `SELECT rl.layer_id as "layerId", rl.can_read as "canRead", rl.can_edit as "canEdit",
              l.name, l.type, l.group_name as "groupName"
       FROM sys_role_layer rl
       LEFT JOIN map_layer l ON l.id = rl.layer_id
       WHERE rl.role_id = $1`,
      [roleId],
    );

    return layers;
  }
}
