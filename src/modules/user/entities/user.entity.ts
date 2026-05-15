import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SysRole } from '../../role/entities/role.entity';

@Entity('sys_user')
export class SysUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ length: 255, comment: '密码(bcrypt)' })
  password: string;

  @Column({ length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ length: 255, nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @ManyToMany(() => SysRole, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'sys_user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: SysRole[];
}
