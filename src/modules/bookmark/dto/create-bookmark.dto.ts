import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreateBookmarkDto {
  @ApiProperty({ description: '书签名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '视角配置' })
  @IsNotEmpty()
  @IsObject()
  view: any;

  @ApiPropertyOptional({ description: '缩略图URL' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class UpdateBookmarkDto {
  @ApiPropertyOptional({ description: '书签名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '视角配置' })
  @IsOptional()
  @IsObject()
  view?: any;

  @ApiPropertyOptional({ description: '缩略图URL' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
