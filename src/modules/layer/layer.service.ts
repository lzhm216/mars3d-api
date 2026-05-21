import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapLayer } from './entities/layer.entity';
import { MapLayerGroup } from './entities/layer-group.entity';
import { CreateLayerDto, UpdateLayerDto } from './dto/create-layer.dto';
import { PageQueryDto, PageResult } from '../../common/dto/page-query.dto';

@Injectable()
export class LayerService {
  constructor(
    @InjectRepository(MapLayer)
    private readonly layerRepo: Repository<MapLayer>,
    @InjectRepository(MapLayerGroup)
    private readonly groupRepo: Repository<MapLayerGroup>,
  ) {}

  async findAll(query: PageQueryDto & { keyword?: string; type?: string; groupId?: number }) {
    const { page = 1, pageSize = 20, keyword, type, groupId } = query;
    const qb = this.layerRepo.createQueryBuilder('layer')
      .leftJoinAndSelect('layer.group', 'group');

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
    
    // 平铺数据以兼容原有 groupName
    const listWithGroupName = list.map(item => ({
      ...item,
      groupName: item.group?.name || '默认分组'
    }));

    return new PageResult(listWithGroupName, total, page, pageSize);
  }

  async findOne(id: number) {
    const layer = await this.layerRepo.findOne({
      relations: ['group'],
      where: { id }
    });
    if (!layer) throw new NotFoundException('图层不存在');
    
    return {
      ...layer,
      groupName: layer.group?.name || '默认分组'
    };
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
    if (!userId || isNaN(userId)) {
      return [];
    }
    const roleIds = (roles || []).map((r) => r.id).filter(id => id && !isNaN(Number(id)));
    const isAdmin = (roles || []).some((r) => r.code === 'admin');

    try {
      let layers: MapLayer[] = [];

      if (isAdmin) {
        // admin 角色可以读取所有的启用图层
        layers = await this.layerRepo.createQueryBuilder('layer')
          .leftJoinAndSelect('layer.group', 'group')
          .where('layer.status = 1')
          .orderBy('layer.group_id', 'ASC')
          .addOrderBy('layer.sortOrder', 'ASC')
          .getMany();
      } else {
        if (roleIds.length === 0) return [];
        // 普通角色：仅查询已被角色绑定的关联图层
        layers = await this.layerRepo.createQueryBuilder('layer')
          .leftJoinAndSelect('layer.roleLayers', 'roleLayer')
          .leftJoinAndSelect('layer.group', 'group')
          .where('roleLayer.role_id IN (:...roleIds)', { roleIds })
          .andWhere('layer.status = 1')
          .orderBy('layer.group_id', 'ASC')
          .addOrderBy('layer.sortOrder', 'ASC')
          .getMany();
      }

      return layers.map((layer) => {
        let canRead = true;
        let canEdit = true;

        if (!isAdmin) {
          const myRoleLayers = layer.roleLayers.filter(
            rl => roleIds.includes(rl.role?.id || (rl as any).roleId || (rl as any).role_id)
          );
          canRead = myRoleLayers.some(rl => rl.canRead);
          canEdit = myRoleLayers.some(rl => rl.canEdit);
        }

        const { roleLayers, group, ...rest } = layer;
        return {
          ...rest,
          groupName: group?.name || '默认分组',
          canRead,
          canEdit,
        };
      });
    } catch (e) {
      // 安全降级：Fail-Closed 原则，发生数据库异常时不泄漏任何图层
      console.error('查询角色图层权限失败 (Fail-Closed):', e.message);
      return [];
    }
  }

  async getDynamicConfig(userId: number, roles: any[]) {
    // 1. 获取基础 config.json 文件内容作为模板
    let configJson: any = {};
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.resolve('d:/code/mars3d/mars3d-vue-project/public/config/config.json');
      if (fs.existsSync(configPath)) {
        let content = fs.readFileSync(configPath, 'utf8');
        if (content.charCodeAt(0) === 0xfeff) {
          content = content.slice(1);
        }
        configJson = JSON.parse(content);
      }
    } catch (e) {
      console.error('读取 config.json 模板失败:', e.message);
    }

    // 2. 获取当前用户有权访问的全部图层
    const accessibleLayers = await this.getAccessibleLayers(userId, roles);

    // 3. 提取地形配置 (terrain)
    const terrainLayer = accessibleLayers.find(l => l.category === 'terrain');
    if (terrainLayer) {
      configJson.terrain = {
        ...(configJson.terrain || {}),
        url: terrainLayer.url,
        show: terrainLayer.show,
        ...(terrainLayer.config || {})
      };
    } else {
      configJson.terrain = { show: false }; // 没有权限，不显示地形
    }

    // 4. 组装底图 (basemaps)
    const dbBasemaps = accessibleLayers.filter(l => l.category === 'basemap');
    configJson.basemaps = this.buildLayerTree(dbBasemaps);

    // 5. 组装专题图层 (layers)
    const dbLayers = accessibleLayers.filter(l => l.category === 'layer');
    configJson.layers = this.buildLayerTree(dbLayers);

    return configJson;
  }

  private buildLayerTree(layers: any[]): any[] {
    const list: any[] = [];
    for (const l of layers) {
      const item: any = {
        id: l.id,
        name: l.name,
        type: l.type,
        url: l.url || undefined,
        show: l.show,
        sortOrder: l.sortOrder,
        ...(l.config || {})
      };
      if (l.pid) {
        item.pid = l.pid;
      }
      list.push(item);
    }
    // 按照 sortOrder 排序
    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async exportConfig() {
    const layers = await this.layerRepo.find({
      relations: ['group'],
      where: { status: 1 },
      order: { groupId: 'ASC', sortOrder: 'ASC' },
    });

    const groups = new Map<number, any[]>();
    for (const layer of layers) {
      const gid = layer.groupId || 0;
      if (!groups.has(gid)) groups.set(gid, []);
      groups.get(gid).push(layer.config || { name: layer.name, type: layer.type, url: layer.url });
    }

    const result: any[] = [];
    for (const [gid, items] of groups) {
      const firstLayer = layers.find((l) => l.groupId === gid);
      const groupName = firstLayer?.group?.name || `分组${gid}`;
      result.push({
        name: groupName,
        pid: gid,
        layers: items,
      });
    }

    return result;
  }

  // ==================== 图层分组管理 ====================

  async findGroups() {
    return this.groupRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async createGroup(name: string, sortOrder = 0) {
    const group = this.groupRepo.create({ name, sortOrder });
    return this.groupRepo.save(group);
  }

  async removeGroup(id: number) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('分组不存在');
    await this.groupRepo.remove(group);
    return { message: '删除成功' };
  }
}
