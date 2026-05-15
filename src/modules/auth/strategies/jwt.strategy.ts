import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysUser } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(SysUser)
    private readonly userRepo: Repository<SysUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'mars3d-jwt-secret-key-2026',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 提取权限码列表
    const permissions: string[] = [];
    if (user.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          for (const perm of role.permissions) {
            if (!permissions.includes(perm.code)) {
              permissions.push(perm.code);
            }
          }
        }
      }
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      roles: user.roles?.map((r) => ({ id: r.id, name: r.name, code: r.code })) || [],
      permissions,
    };
  }
}
