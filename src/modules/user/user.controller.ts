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
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from './dto/create-user.dto';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-perm.decorator';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermission('system:user:list')
  @ApiOperation({ summary: '用户列表' })
  findAll(@Query() query: PageQueryDto & { keyword?: string; status?: number }) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('system:user:list')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: number) {
    return this.userService.findOne(+id);
  }

  @Post()
  @RequirePermission('system:user:create')
  @ApiOperation({ summary: '创建用户' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @RequirePermission('system:user:edit')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('system:user:delete')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: number) {
    return this.userService.remove(+id);
  }

  @Put(':id/status')
  @RequirePermission('system:user:edit')
  @ApiOperation({ summary: '切换用户状态' })
  toggleStatus(@Param('id') id: number) {
    return this.userService.toggleStatus(+id);
  }

  @Post(':id/roles')
  @RequirePermission('system:user:edit')
  @ApiOperation({ summary: '分配角色' })
  assignRoles(@Param('id') id: number, @Body() dto: AssignRolesDto) {
    return this.userService.assignRoles(+id, dto.roleIds);
  }
}
