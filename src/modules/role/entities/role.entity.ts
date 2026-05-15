import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SysUser } from '../../user/entities/user.entity';
import { SysPermission } from '../../permission/entities/permission.entity';
import { MapLayer } from '../../layer/entities/layer.entity';

@Entity('sys_role')
export class SysRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: '角色名称' })
  name: string;

  @Column({ length: 50, unique: true, comment: '角色编码' })
  code: string;

  @Column({ length: 255, nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @ManyToMany(() => SysUser, (user) => user.roles)
  users: SysUser[];

  @ManyToMany(() => SysPermission, (perm) => perm.roles, { eager: true })
  @JoinTable({
    name: 'sys_role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: SysPermission[];

  @ManyToMany(() => MapLayer, (layer) => layer.roles)
  @JoinTable({
    name: 'sys_role_layer',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'layer_id', referencedColumnName: 'id' },
  })
  layers: MapLayer[];
}
