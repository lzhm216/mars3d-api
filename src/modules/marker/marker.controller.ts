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
import { MarkerService } from './marker.service';
import { CreateMarkerDto, UpdateMarkerDto } from './dto/create-marker.dto';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-perm.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('地图标记')
@Controller('markers')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MarkerController {
  constructor(private readonly markerService: MarkerService) {}

  @Get()
  @RequirePermission('map:marker:list')
  @ApiOperation({ summary: '标记列表' })
  findAll(@Query() query: PageQueryDto & { userId?: number; layerId?: number; type?: string }) {
    return this.markerService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: '获取当前用户的标记' })
  getMy(@CurrentUser('id') userId: number) {
    return this.markerService.getMyMarkers(userId);
  }

  @Get('accessible')
  @ApiOperation({ summary: '获取当前用户可见的标记（含权限过滤）' })
  getAccessible(@CurrentUser() user: any) {
    return this.markerService.getAccessibleMarkers(user.id, user.roles);
  }

  @Get(':id')
  @ApiOperation({ summary: '标记详情' })
  findOne(@Param('id') id: number) {
    return this.markerService.findOne(+id);
  }

  @Post()
  @RequirePermission('map:marker:create')
  @ApiOperation({ summary: '创建标记' })
  create(@Body() dto: CreateMarkerDto, @CurrentUser('id') userId: number) {
    return this.markerService.create(dto, userId);
  }

  @Put(':id')
  @RequirePermission('map:marker:edit')
  @ApiOperation({ summary: '更新标记' })
  update(@Param('id') id: number, @Body() dto: UpdateMarkerDto) {
    return this.markerService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('map:marker:delete')
  @ApiOperation({ summary: '删除标记' })
  remove(@Param('id') id: number) {
    return this.markerService.remove(+id);
  }
}
