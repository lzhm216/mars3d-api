import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SysUser } from '../user/entities/user.entity';
import { SysRefreshToken } from './entities/refresh-token.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SysUser)
    private readonly userRepo: Repository<SysUser>,
    @InjectRepository(SysRefreshToken)
    private readonly refreshTokenRepo: Repository<SysRefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw new ForbiddenException('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    const record = await this.refreshTokenRepo.findOne({
      where: { token },
    });

    if (!record || new Date() > record.expiresAt) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    // 删除旧的 refresh token
    await this.refreshTokenRepo.delete({ token });

    const user = await this.userRepo.findOne({
      where: { id: record.userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return this.generateTokens(user);
  }

  async logout(userId: number) {
    await this.refreshTokenRepo.delete({ userId });
    return { message: '已注销' };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('旧密码错误');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    // 清除所有 refresh token，强制重新登录
    await this.refreshTokenRepo.delete({ userId });

    return { message: '密码修改成功，请重新登录' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const permissions: string[] = [];
    const menuPermissions: any[] = [];
    for (const role of user.roles || []) {
      for (const perm of role.permissions || []) {
        if (!permissions.includes(perm.code)) {
          permissions.push(perm.code);
        }
        if (perm.type === 1 && !menuPermissions.find((m) => m.id === perm.id)) {
          menuPermissions.push(perm);
        }
      }
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      roles: user.roles?.map((r) => ({ id: r.id, name: r.name, code: r.code })) || [],
      permissions,
      menus: this.buildMenuTree(menuPermissions),
    };
  }

  private async generateTokens(user: SysUser) {
    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });

    const refreshToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      }),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        roles: user.roles?.map((r) => ({ id: r.id, name: r.name, code: r.code })) || [],
      },
    };
  }

  private buildMenuTree(menus: any[], parentId = 0): any[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => ({
        id: m.id,
        name: m.name,
        code: m.code,
        path: m.path,
        icon: m.icon,
        children: this.buildMenuTree(menus, m.id),
      }));
  }
}
