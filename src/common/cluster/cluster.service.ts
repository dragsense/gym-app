import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cluster from 'node:cluster';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class ClusterService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ClusterService.name);
  private isMaster = false;
  private workers: any[] = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const clusterEnabled = this.configService.get<boolean>('cluster.enabled', false);
    const numWorkers = this.configService.get<number>('cluster.workers', os.cpus().length);

    if (!clusterEnabled) {
      this.logger.log('Cluster mode disabled - running in single process');
      return;
    }

    if (cluster.isPrimary) {
      this.isMaster = true;
      await this.createWorkers(numWorkers);
    } else {
      this.logger.log(`Worker ${process.pid} started`);
    }
  }

  async onModuleDestroy() {
    if (this.isMaster) {
      this.logger.log('Shutting down cluster...');
      for (const worker of this.workers) {
        worker.kill();
      }
    }
  }

  private async createWorkers(numWorkers: number) {
    this.logger.log(`Starting cluster with ${numWorkers} workers`);

    for (let i = 0; i < numWorkers; i++) {
      const worker = cluster.fork();
      this.workers.push(worker);

      worker.on('message', (message) => {
        this.logger.debug(`Message from worker ${worker.process.pid}: ${JSON.stringify(message)}`);
      });

      worker.on('exit', (code, signal) => {
        this.logger.warn(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        
        // Remove from workers array
        const index = this.workers.indexOf(worker);
        if (index > -1) {
          this.workers.splice(index, 1);
        }

        // Restart worker if it wasn't killed intentionally
        if (!worker.exitedAfterDisconnect) {
          this.logger.log(`Restarting worker ${worker.process.pid}`);
          const newWorker = cluster.fork();
          this.workers.push(newWorker);
        }
      });

      worker.on('error', (error) => {
        this.logger.error(`Worker ${worker.process.pid} error: ${error.message}`);
      });
    }

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      this.logger.log('SIGTERM received, shutting down workers gracefully');
      for (const worker of this.workers) {
        worker.kill('SIGTERM');
      }
    });

    process.on('SIGINT', () => {
      this.logger.log('SIGINT received, shutting down workers gracefully');
      for (const worker of this.workers) {
        worker.kill('SIGINT');
      }
    });
  }

  getClusterInfo() {
    return {
      isMaster: this.isMaster,
      isWorker: !this.isMaster,
      processId: process.pid,
      workers: this.workers.map(worker => ({
        id: worker.id,
        pid: worker.process.pid,
        connected: worker.isConnected(),
      })),
      totalWorkers: this.workers.length,
    };
  }

  getSystemInfo() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      cpu: {
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        speed: cpus[0]?.speed || 0,
        usage: this.getCpuUsage(),
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        usage: Math.round((usedMemory / totalMemory) * 100),
        unit: 'bytes',
      },
      loadAverage: os.loadavg(),
    };
  }

  getProcessInfo() {
    const memUsage = process.memoryUsage();
    
    return {
      pid: process.pid,
      ppid: process.ppid,
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      cpu: {
        user: process.cpuUsage().user,
        system: process.cpuUsage().system,
      },
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }

  getDetailedClusterInfo() {
    return {
      cluster: this.getClusterInfo(),
      system: this.getSystemInfo(),
      process: this.getProcessInfo(),
      timestamp: new Date().toISOString(),
    };
  }

  private getCpuUsage(): number {
    // Simple CPU usage calculation
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    
    return Math.round(100 - (idle / total) * 100);
  }

  isClusterEnabled(): boolean {
    return this.configService.get<boolean>('cluster.enabled', false);
  }

  isPrimaryProcess(): boolean {
    return this.isMaster;
  }

  isWorkerProcess(): boolean {
    return !this.isMaster;
  }
}
    