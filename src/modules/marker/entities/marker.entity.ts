import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SysUser } from '../../user/entities/user.entity';
import { MapLayer } from '../../layer/entities/layer.entity';

@Entity('map_marker')
export class MapMarker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId', type: 'int', comment: '所属用户ID' })
  userId: number;

  @ManyToOne(() => SysUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: SysUser;

  @Column({ length: 100, nullable: true, comment: '标记名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ length: 50, comment: '类型: point/polyline/polygon/label' })
  type: string;

  @Column({ type: 'jsonb', comment: 'GeoJSON geometry' })
  geometry: any;

  @Column({ type: 'jsonb', nullable: true, comment: '样式配置' })
  style: any;

  @Column({ type: 'jsonb', nullable: true, comment: '自定义属性' })
  properties: any;

  @Column({ name: 'layerId', type: 'int', nullable: true, comment: '归属图层ID' })
  layerId: number;

  @ManyToOne(() => MapLayer, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'layerId' })
  layer: MapLayer;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @CreateDateColumn({ name: 'createdAt', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', comment: '更新时间' })
  updatedAt: Date;
}
