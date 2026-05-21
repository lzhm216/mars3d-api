import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { MapLayerGroup } from './layer-group.entity';
import { SysRoleLayer } from '../../role/entities/role-layer.entity';

@Entity('map_layer')
export class MapLayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: '图层名称' })
  name: string;

  @Column({ length: 50, comment: '图层类型: wms/geojson/arcgis/tileset 等' })
  type: string;

  @Column({ type: 'text', nullable: true, comment: '图层URL' })
  url: string;

  @Column({ type: 'jsonb', nullable: true, comment: '图层完整JSON配置' })
  config: any;

  @Column({ name: 'group_id', type: 'int', nullable: true, comment: '分组ID' })
  groupId: number;

  @ManyToOne(() => MapLayerGroup, (group) => group.layers, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'group_id' })
  group: MapLayerGroup;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @Column({ name: 'created_by', type: 'int', nullable: true, comment: '创建人ID' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => SysRoleLayer, (roleLayer) => roleLayer.layer)
  roleLayers: SysRoleLayer[];

  @Column({ name: 'pid', type: 'int', nullable: true, comment: '父级图层ID' })
  pid: number;

  @ManyToOne(() => MapLayer, (layer) => layer.children, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'pid' })
  parent: MapLayer;

  @OneToMany(() => MapLayer, (layer) => layer.parent)
  children: MapLayer[];

  @Column({ length: 50, default: 'layer', comment: '图层分类: terrain/basemap/layer' })
  category: string;

  @Column({ type: 'boolean', default: false, comment: '是否默认显示/加载' })
  show: boolean;
}
