import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-perm.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 未设置权限要求则放行
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('未获取到用户信息');
    }

    // 超级管理员拥有全部权限
    if (user.roles?.some((r: any) => r.code === 'admin')) {
      return true;
    }

    // 检查用户权限列表
    const userPermissions: string[] = user.permissions || [];
    const hasPermission = requiredPermissions.some((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`需要权限: ${requiredPermissions.join(' 或 ')}`);
    }

    return true;
  }
}
