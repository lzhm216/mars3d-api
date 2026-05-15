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
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, AssignLayersDto } from './dto/create-role.dto';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-perm.decorator';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermission('system:role:list')
  @ApiOperation({ summary: '角色列表' })
  findAll(@Query() query: PageQueryDto & { keyword?: string }) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('system:role:list')
  @ApiOperation({ summary: '角色详情' })
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(+id);
  }

  @Post()
  @RequirePermission('system:role:create')
  @ApiOperation({ summary: '创建角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put(':id')
  @RequirePermission('system:role:edit')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('system:role:delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: number) {
    return this.roleService.remove(+id);
  }

  @Put(':id/permissions')
  @RequirePermission('system:role:edit')
  @ApiOperation({ summary: '分配权限' })
  assignPermissions(@Param('id') id: number, @Body() dto: AssignPermissionsDto) {
    return this.roleService.assignPermissions(+id, dto.permissionIds);
  }

  @Put(':id/layers')
  @RequirePermission('system:role:edit')
  @ApiOperation({ summary: '分配图层权限' })
  assignLayers(@Param('id') id: number, @Body() dto: AssignLayersDto) {
    return this.roleService.assignLayers(+id, dto);
  }

  @Get(':id/layers')
  @RequirePermission('system:role:list')
  @ApiOperation({ summary: '获取角色图层权限' })
  getRoleLayers(@Param('id') id: number) {
    return this.roleService.getRoleLayers(+id);
  }
}
