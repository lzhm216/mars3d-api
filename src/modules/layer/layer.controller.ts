import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LayerService } from './layer.service';
import { CreateLayerDto, UpdateLayerDto } from './dto/create-layer.dto';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-perm.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('图层配置')
@Controller('map-layers')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class LayerController {
  constructor(private readonly layerService: LayerService) {}

  @Get()
  @RequirePermission('map:layer:list')
  @ApiOperation({ summary: '图层列表' })
  findAll(@Query() query: PageQueryDto & { keyword?: string; type?: string; groupId?: number }) {
    return this.layerService.findAll(query);
  }

  @Get('accessible')
  @ApiOperation({ summary: '获取当前用户可访问的图层' })
  getAccessible(@CurrentUser() user: any) {
    return this.layerService.getAccessibleLayers(user.id, user.roles);
  }

  @Get('config/export')
  @RequirePermission('map:layer:list')
  @ApiOperation({ summary: '导出图层配置（兼容 config.json）' })
  exportConfig() {
    return this.layerService.exportConfig();
  }

  @Get(':id')
  @RequirePermission('map:layer:list')
  @ApiOperation({ summary: '图层详情' })
  findOne(@Param('id') id: number) {
    return this.layerService.findOne(+id);
  }

  @Post()
  @RequirePermission('map:layer:create')
  @ApiOperation({ summary: '创建图层' })
  create(@Body() dto: CreateLayerDto, @CurrentUser('id') userId: number) {
    return this.layerService.create(dto, userId);
  }

  @Put(':id')
  @RequirePermission('map:layer:edit')
  @ApiOperation({ summary: '更新图层' })
  update(@Param('id') id: number, @Body() dto: UpdateLayerDto) {
    return this.layerService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('map:layer:delete')
  @ApiOperation({ summary: '删除图层' })
  remove(@Param('id') id: number) {
    return this.layerService.remove(+id);
  }
}
