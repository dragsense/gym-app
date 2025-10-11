import { Controller, Get } from '@nestjs/common';
import { ClusterService } from './cluster.service';

@Controller('cluster')
export class ClusterController {
  constructor(private readonly clusterService: ClusterService) {}

  @Get('info')
  getClusterInfo() {
    return this.clusterService.getClusterInfo();
  }

  @Get('status')
  getClusterStatus() {
    return {
      enabled: this.clusterService.isClusterEnabled(),
      isPrimary: this.clusterService.isPrimaryProcess(),
      isWorker: this.clusterService.isWorkerProcess(),
    };
  }

  @Get('system')
  getSystemInfo() {
    return this.clusterService.getSystemInfo();
  }

  @Get('process')
  getProcessInfo() {
    return this.clusterService.getProcessInfo();
  }

  @Get('detailed')
  getDetailedInfo() {
    return this.clusterService.getDetailedClusterInfo();
  }
}
