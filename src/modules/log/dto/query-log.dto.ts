import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

export class QueryLogDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: '用户名' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '模块' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: '操作类型' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsString()
  endTime?: string;
}
