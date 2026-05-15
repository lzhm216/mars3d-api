import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { SysLog } from './entities/log.entity';
import { QueryLogDto } from './dto/query-log.dto';
import { PageResult } from '../../common/dto/page-query.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(SysLog)
    private readonly logRepo: Repository<SysLog>,
  ) {}

  async findAll(query: QueryLogDto) {
    const { page = 1, pageSize = 20, userId, username, module, action, startTime, endTime } = query;
    const qb = this.logRepo.createQueryBuilder('log');

    if (userId) {
      qb.andWhere('log.userId = :userId', { userId });
    }
    if (username) {
      qb.andWhere('log.username LIKE :username', { username: `%${username}%` });
    }
    if (module) {
      qb.andWhere('log.module = :module', { module });
    }
    if (action) {
      qb.andWhere('log.action = :action', { action });
    }
    if (startTime) {
      qb.andWhere('log.createdAt >= :startTime', { startTime });
    }
    if (endTime) {
      qb.andWhere('log.createdAt <= :endTime', { endTime });
    }

    qb.orderBy('log.id', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();
    return new PageResult(list, total, page, pageSize);
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, todayLogins, moduleStats] = await Promise.all([
      this.logRepo.count(),
      this.logRepo.count({ where: { createdAt: Between(today, new Date()) as any } }),
      this.logRepo.count({ where: { action: 'login', createdAt: Between(today, new Date()) as any } }),
      this.logRepo
        .createQueryBuilder('log')
        .select('log.module', 'module')
        .addSelect('COUNT(*)', 'count')
        .groupBy('log.module')
        .getRawMany(),
    ]);

    return {
      totalLogs,
      todayLogs,
      todayLogins,
      moduleStats,
    };
  }
}
