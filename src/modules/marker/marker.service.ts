import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapMarker } from './entities/marker.entity';
import { CreateMarkerDto, UpdateMarkerDto } from './dto/create-marker.dto';
import { PageQueryDto, PageResult } from '../../common/dto/page-query.dto';

@Injectable()
export class MarkerService {
  constructor(
    @InjectRepository(MapMarker)
    private readonly markerRepo: Repository<MapMarker>,
  ) {}

  async findAll(query: PageQueryDto & { userId?: number; layerId?: number; type?: string }) {
    const { page = 1, pageSize = 20, userId, layerId, type } = query;
    const qb = this.markerRepo.createQueryBuilder('marker');

    if (userId) {
      qb.where('marker.userId = :userId', { userId });
    }
    if (layerId) {
      qb.andWhere('marker.layerId = :layerId', { layerId });
    }
    if (type) {
      qb.andWhere('marker.type = :type', { type });
    }

    qb.orderBy('marker.id', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();
    return new PageResult(list, total, page, pageSize);
  }

  async findOne(id: number) {
    const marker = await this.markerRepo.findOne({ where: { id } });
    if (!marker) throw new NotFoundException('标记不存在');
    return marker;
  }

  async create(dto: CreateMarkerDto, userId: number) {
    const marker = this.markerRepo.create({ ...dto, userId });
    return this.markerRepo.save(marker);
  }

  async update(id: number, dto: UpdateMarkerDto) {
    const marker = await this.markerRepo.findOne({ where: { id } });
    if (!marker) throw new NotFoundException('标记不存在');

    Object.assign(marker, dto);
    return this.markerRepo.save(marker);
  }

  async remove(id: number) {
    const marker = await this.markerRepo.findOne({ where: { id } });
    if (!marker) throw new NotFoundException('标记不存在');

    await this.markerRepo.remove(marker);
    return { message: '删除成功' };
  }

  async getMyMarkers(userId: number) {
    return this.markerRepo.find({
      where: { userId, status: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  async getAccessibleMarkers(userId: number, roles: any[]) {
    const roleIds = (roles || []).map((r) => r.id);

    // 获取用户角色可访问的图层 ID
    let accessibleLayerIds: number[] = [];
    if (roleIds.length > 0) {
      try {
        const result = await this.markerRepo.query(
          `SELECT DISTINCT layer_id FROM sys_role_layer WHERE role_id = ANY($1) AND can_read = true`,
          [roleIds],
        );
        accessibleLayerIds = result.map((r: any) => r.layer_id).filter(Boolean);
      } catch (e) {
        console.warn('查询角色图层权限失败:', e.message);
      }
    }

    // 查询：用户自己的标记 + 角色可访问图层的标记
    const qb = this.markerRepo.createQueryBuilder('marker');
    qb.where('marker.status = 1');

    if (accessibleLayerIds.length > 0) {
      qb.andWhere(
        '(marker.userId = :userId OR marker.layerId IN (:...layerIds))',
        { userId, layerIds: accessibleLayerIds },
      );
    } else {
      qb.andWhere('marker.userId = :userId', { userId });
    }

    qb.orderBy('marker.createdAt', 'DESC');
    return qb.getMany();
  }
}
