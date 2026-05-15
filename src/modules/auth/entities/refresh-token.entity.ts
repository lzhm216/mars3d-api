import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('sys_refresh_token')
@Index('IDX_REFRESH_TOKEN', ['token'])
export class SysRefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ length: 500, comment: '刷新令牌' })
  token: string;

  @Column({ type: 'timestamp', comment: '过期时间' })
  expiresAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
