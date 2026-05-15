import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { SysRole } from '../../role/entities/role.entity';

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

  @Column({ type: 'int', default: 0, comment: '分组ID' })
  groupId: number;

  @Column({ length: 50, nullable: true, comment: '分组名称' })
  groupName: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @Column({ type: 'int', nullable: true, comment: '创建人ID' })
  createdBy: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @ManyToMany(() => SysRole, (role) => role.layers)
  roles: SysRole[];
}
