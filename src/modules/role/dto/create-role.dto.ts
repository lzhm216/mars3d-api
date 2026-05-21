import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsArray()
  permissionIds: number[];
}

export class LayerPermissionItemDto {
  @ApiProperty({ description: '图层ID' })
  @IsNumber()
  @Type(() => Number)
  layerId: number;

  @ApiProperty({ description: '可读' })
  @IsBoolean()
  @Type(() => Boolean)
  canRead: boolean;

  @ApiProperty({ description: '可编辑' })
  @IsBoolean()
  @Type(() => Boolean)
  canEdit: boolean;
}

export class AssignLayersDto {
  @ApiProperty({ description: '图层权限列表', type: [LayerPermissionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayerPermissionItemDto)
  layers: LayerPermissionItemDto[];
}
