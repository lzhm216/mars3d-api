import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SysUser } from '../../user/entities/user.entity';

@Entity('map_bookmark')
export class MapBookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId', type: 'int', comment: '所属用户ID' })
  userId: number;

  @ManyToOne(() => SysUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: SysUser;

  @Column({ length: 100, comment: '书签名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'jsonb', comment: '视角配置: camera position/extent' })
  view: any;

  @Column({ length: 255, nullable: true, comment: '缩略图URL' })
  thumbnail: string;

  @CreateDateColumn({ name: 'createdAt', comment: '创建时间' })
  createdAt: Date;
}
