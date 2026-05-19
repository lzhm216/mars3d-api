import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNotEmpty, IsObject } from 'class-validator';

export class CreateMarkerDto {
  @ApiPropertyOptional({ description: '标记名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '类型: point/polyline/polygon/label' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'GeoJSON geometry' })
  @IsNotEmpty()
  @IsObject()
  geometry: any;

  @ApiPropertyOptional({ description: '样式配置' })
  @IsOptional()
  @IsObject()
  style?: any;

  @ApiPropertyOptional({ description: '自定义属性' })
  @IsOptional()
  @IsObject()
  properties?: any;

  @ApiPropertyOptional({ description: '归属图层ID' })
  @IsOptional()
  @IsInt()
  layerId?: number;
}

export class UpdateMarkerDto {
  @ApiPropertyOptional({ description: '标记名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'GeoJSON geometry' })
  @IsOptional()
  geometry?: any;

  @ApiPropertyOptional({ description: '样式配置' })
  @IsOptional()
  style?: any;

  @ApiPropertyOptional({ description: '自定义属性' })
  @IsOptional()
  properties?: any;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  status?: number;
}
