import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '角色编码' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  status?: number;
}

export class AssignPermissionsDto {
  @ApiProperty({ description: '权限ID列表', type: [Number] })
  permissionIds: number[];
}

export class AssignLayersDto {
  @ApiProperty({ description: '图层权限列表' })
  layers: { layerId: number; canRead: boolean; canEdit: boolean }[];
}
