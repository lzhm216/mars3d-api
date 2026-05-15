import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
