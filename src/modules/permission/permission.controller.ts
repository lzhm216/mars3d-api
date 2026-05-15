import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-perm.decorator';

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permService: PermissionService) {}

  @Get('tree')
  @RequirePermission('system:permission:list')
  @ApiOperation({ summary: '获取权限树' })
  getTree() {
    return this.permService.getTree();
  }

  @Get()
  @RequirePermission('system:permission:list')
  @ApiOperation({ summary: '权限列表' })
  findAll() {
    return this.permService.findAll();
  }

  @Get(':id')
  @RequirePermission('system:permission:list')
  @ApiOperation({ summary: '权限详情' })
  findOne(@Param('id') id: number) {
    return this.permService.findOne(+id);
  }

  @Post()
  @RequirePermission('system:permission:create')
  @ApiOperation({ summary: '创建权限' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permService.create(dto);
  }

  @Put(':id')
  @RequirePermission('system:permission:edit')
  @ApiOperation({ summary: '更新权限' })
  update(@Param('id') id: number, @Body() dto: UpdatePermissionDto) {
    return this.permService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('system:permission:delete')
  @ApiOperation({ summary: '删除权限' })
  remove(@Param('id') id: number) {
    return this.permService.remove(+id);
  }
}
