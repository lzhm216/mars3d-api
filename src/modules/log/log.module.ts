import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { SysLog } from './entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysLog])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
