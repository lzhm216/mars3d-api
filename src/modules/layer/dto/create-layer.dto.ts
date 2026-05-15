import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateLayerDto {
  @ApiProperty({ description: '图层名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '图层类型', example: 'wms' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: '图层URL' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: '图层JSON配置' })
  @IsOptional()
  config?: any;

  @ApiPropertyOptional({ description: '分组ID', default: 0 })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({ description: '分组名称' })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateLayerDto {
  @ApiPropertyOptional({ description: '图层名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '图层类型' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: '图层URL' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: '图层JSON配置' })
  @IsOptional()
  config?: any;

  @ApiPropertyOptional({ description: '分组ID' })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({ description: '分组名称' })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  status?: number;
}
