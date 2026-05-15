import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarkerController } from './marker.controller';
import { MarkerService } from './marker.service';
import { MapMarker } from './entities/marker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapMarker])],
  controllers: [MarkerController],
  providers: [MarkerService],
  exports: [MarkerService],
})
export class MarkerModule {}
