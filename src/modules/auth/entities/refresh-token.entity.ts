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

  @Column({ name: 'userId', type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ length: 500, comment: '刷新令牌' })
  token: string;

  @Column({ name: 'expiresAt', type: 'timestamp', comment: '过期时间' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'createdAt', comment: '创建时间' })
  createdAt: Date;
}
