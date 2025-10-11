import { Module } from '@nestjs/common';
import { ClusterService } from './cluster.service';
import { ClusterController } from './cluster.controller';

@Module({
  providers: [ClusterService],
  controllers: [ClusterController],
  exports: [ClusterService],
})
export class ClusterModule {}
