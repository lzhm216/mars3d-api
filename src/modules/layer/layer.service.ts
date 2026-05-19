import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapLayer } from './entities/layer.entity';
import { CreateLayerDto, UpdateLayerDto } from './dto/create-layer.dto';
import { PageQueryDto, PageResult } from '../../common/dto/page-query.dto';

@Injectable()
export class LayerService {
  constructor(
    @InjectRepository(MapLayer)
    private readonly layerRepo: Repository<MapLayer>,
  ) {}

  async findAll(query: PageQueryDto & { keyword?: string; type?: string; groupId?: number }) {
    const { page = 1, pageSize = 20, keyword, type, groupId } = query;
    const qb = this.layerRepo.createQueryBuilder('layer');

    if (keyword) {
      qb.where('layer.name LIKE :kw', { kw: `%${keyword}%` });
    }
    if (type) {
      qb.andWhere('layer.type = :type', { type });
    }
    if (groupId !== undefined) {
      qb.andWhere('layer.groupId = :groupId', { groupId });
    }

    qb.orderBy('layer.groupId', 'ASC').addOrderBy('layer.sortOrder', 'ASC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();
    return new PageResult(list, total, page, pageSize);
  }

  async findOne(id: number) {
    const layer = await this.layerRepo.findOne({ where: { id } });
    if (!layer) throw new NotFoundException('图层不存在');
    return layer;
  }

  async create(dto: CreateLayerDto, userId?: number) {
    const layer = this.layerRepo.create({ ...dto, createdBy: userId });
    return this.layerRepo.save(layer);
  }

  async update(id: number, dto: UpdateLayerDto) {
    const layer = await this.layerRepo.findOne({ where: { id } });
    if (!layer) throw new NotFoundException('图层不存在');

    Object.assign(layer, dto);
    return this.layerRepo.save(layer);
  }

  async remove(id: number) {
    const layer = await this.layerRepo.findOne({ where: { id } });
    if (!layer) throw new NotFoundException('图层不存在');

    await this.layerRepo.remove(layer);
    return { message: '删除成功' };
  }

  async getAccessibleLayers(userId: number, roles: any[]) {
    const roleIds = (roles || []).map((r) => r.id);
    if (roleIds.length === 0) return [];

    // 查询角色可访问的图层
    try {
      const layers = await this.layerRepo.query(
        `SELECT l.*, rl.can_read as "canRead", rl.can_edit as "canEdit"
         FROM map_layer l
         INNER JOIN sys_role_layer rl ON rl.layer_id = l.id
         WHERE rl.role_id = ANY($1) AND l.status = 1
         ORDER BY l.group_id ASC, l.sort_order ASC`,
        [roleIds],
      );

      return layers;
    } catch (e) {
      // sys_role_layer 表可能不存在或无数据，降级返回全部启用图层
      console.warn('查询角色图层权限失败，降级返回全部图层:', e.message);
      return this.layerRepo.find({ where: { status: 1 }, order: { groupId: 'ASC', sortOrder: 'ASC' } });
    }
  }

  async exportConfig() {
    const layers = await this.layerRepo.find({
      where: { status: 1 },
      order: { groupId: 'ASC', sortOrder: 'ASC' },
    });

    // 按分组组织，输出兼容 config.json 的格式
    const groups = new Map<number, any[]>();
    for (const layer of layers) {
      const gid = layer.groupId || 0;
      if (!groups.has(gid)) groups.set(gid, []);
      groups.get(gid).push(layer.config || { name: layer.name, type: layer.type, url: layer.url });
    }

    const result: any[] = [];
    for (const [gid, items] of groups) {
      const firstLayer = layers.find((l) => l.groupId === gid);
      result.push({
        name: firstLayer?.groupName || `分组${gid}`,
        pid: gid,
        layers: items,
      });
    }

    return result;
  }
}
