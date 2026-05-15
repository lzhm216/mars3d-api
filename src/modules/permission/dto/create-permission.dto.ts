import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreatePermissionDto {
  @ApiPropertyOptional({ description: '父级ID, 0为顶级', default: 0 })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: '权限名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权限编码', example: 'system:user:list' })
  @IsString()
  code: string;

  @ApiProperty({ description: '类型: 1菜单 2按钮 3API', enum: [1, 2, 3] })
  @IsIn([1, 2, 3])
  type: number;

  @ApiPropertyOptional({ description: '路由路径或API路径' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: '父级ID' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ description: '权限名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '路由路径或API路径' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  status?: number;
}
