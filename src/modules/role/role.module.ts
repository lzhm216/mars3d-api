import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { SysRole } from './entities/role.entity';
import { SysPermission } from '../permission/entities/permission.entity';
import { MapLayer } from '../layer/entities/layer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysRole, SysPermission, MapLayer])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
