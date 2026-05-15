import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/query-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-perm.decorator';

@ApiTags('日志管理')
@Controller('logs')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @RequirePermission('system:log:list')
  @ApiOperation({ summary: '日志列表' })
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }

  @Get('stats')
  @RequirePermission('system:log:list')
  @ApiOperation({ summary: '日志统计' })
  getStats() {
    return this.logService.getStats();
  }
}
