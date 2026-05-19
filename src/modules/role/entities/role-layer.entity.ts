import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SysRole } from './role.entity';
import { MapLayer } from '../../layer/entities/layer.entity';

@Entity('sys_role_layer')
export class SysRoleLayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'can_read', type: 'boolean', default: true, comment: '可读' })
  canRead: boolean;

  @Column({ name: 'can_edit', type: 'boolean', default: false, comment: '可编辑' })
  canEdit: boolean;

  @ManyToOne(() => SysRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: SysRole;

  @ManyToOne(() => MapLayer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'layer_id' })
  layer: MapLayer;
}
