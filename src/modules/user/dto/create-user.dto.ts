import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '状态: 1启用 0禁用' })
  @IsOptional()
  status?: number;
}

export class AssignRolesDto {
  @ApiProperty({ description: '角色ID列表', type: [Number] })
  roleIds: number[];
}
