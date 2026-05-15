import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SysUser } from '../user/entities/user.entity';
import { SysRefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysUser, SysRefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mars3d-jwt-secret-key-2026',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
