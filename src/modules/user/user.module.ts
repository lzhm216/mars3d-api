import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SysUser } from './entities/user.entity';
import { SysRole } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysUser, SysRole])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
