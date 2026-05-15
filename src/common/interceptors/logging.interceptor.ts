import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { SysLog } from '../../modules/log/entities/log.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logRepo: Repository<SysLog>;

  constructor(private moduleRef: ModuleRef) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;
    const now = Date.now();

    // 仅记录写操作
    if (method === 'GET' || url.includes('/logs')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response) => {
        this.saveLog(user, method, url, body, ip, response, now);
      }),
    );
  }

  private async saveLog(
    user: any,
    method: string,
    url: string,
    body: any,
    ip: string,
    response: any,
    startTime: number,
  ) {
    try {
      if (!this.logRepo) {
        const dataSource = this.moduleRef.get('DataSource', { strict: false });
        if (dataSource) {
          this.logRepo = dataSource.getRepository(SysLog);
        }
      }
      if (!this.logRepo) return;

      const log = this.logRepo.create({
        userId: user?.id,
        username: user?.username,
        module: this.extractModule(url),
        action: this.extractAction(method),
        method,
        url,
        ip: ip || '',
        requestBody: body ? JSON.stringify(body).substring(0, 2000) : null,
        responseCode: response?.code || 200,
        duration: Date.now() - startTime,
      });
      await this.logRepo.save(log);
    } catch {
      // 日志记录不应影响业务
    }
  }

  private extractModule(url: string): string {
    const parts = url.replace('/api/', '').split('/');
    const moduleName = parts[0] || 'unknown';
    const mapping: Record<string, string> = {
      users: 'user',
      roles: 'role',
      permissions: 'permission',
      'map-layers': 'layer',
      markers: 'marker',
      bookmarks: 'bookmark',
      auth: 'auth',
    };
    return mapping[moduleName] || moduleName;
  }

  private extractAction(method: string): string {
    const mapping: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    return mapping[method] || method.toLowerCase();
  }
}
