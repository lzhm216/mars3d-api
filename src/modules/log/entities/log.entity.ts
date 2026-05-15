import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('sys_log')
@Index('IDX_LOG_CREATED', ['createdAt'])
@Index('IDX_LOG_USER', ['userId'])
@Index('IDX_LOG_MODULE_ACTION', ['module', 'action'])
export class SysLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, comment: '用户ID' })
  userId: number;

  @Column({ length: 50, nullable: true, comment: '用户名' })
  username: string;

  @Column({ length: 50, nullable: true, comment: '操作模块' })
  module: string;

  @Column({ length: 50, nullable: true, comment: '操作类型' })
  action: string;

  @Column({ length: 10, nullable: true, comment: '请求方法' })
  method: string;

  @Column({ length: 255, nullable: true, comment: '请求URL' })
  url: string;

  @Column({ length: 50, nullable: true, comment: 'IP地址' })
  ip: string;

  @Column({ type: 'text', nullable: true, comment: '请求体' })
  requestBody: string;

  @Column({ type: 'int', nullable: true, comment: '响应状态码' })
  responseCode: number;

  @Column({ type: 'int', nullable: true, comment: '耗时(ms)' })
  duration: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
