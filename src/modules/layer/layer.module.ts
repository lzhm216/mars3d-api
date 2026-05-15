import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LayerController } from './layer.controller';
import { LayerService } from './layer.service';
import { MapLayer } from './entities/layer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapLayer])],
  controllers: [LayerController],
  providers: [LayerService],
  exports: [LayerService],
})
export class LayerModule {}
