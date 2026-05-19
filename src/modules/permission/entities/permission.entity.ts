import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { SysRole } from '../../role/entities/role.entity';

@Entity('sys_permission')
export class SysPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parentId', type: 'int', default: 0, comment: '父级ID, 0为顶级' })
  parentId: number;

  @Column({ length: 50, comment: '权限名称' })
  name: string;

  @Column({ length: 100, unique: true, comment: '权限编码, 如 system:user:list' })
  code: string;

  @Column({ type: 'smallint', comment: '类型: 1菜单 2按钮 3API' })
  type: number;

  @Column({ length: 255, nullable: true, comment: '路由路径或API路径' })
  path: string;

  @Column({ length: 50, nullable: true, comment: '图标' })
  icon: string;

  @Column({ name: 'sortOrder', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @ManyToMany(() => SysRole, (role) => role.permissions)
  roles: SysRole[];
}
