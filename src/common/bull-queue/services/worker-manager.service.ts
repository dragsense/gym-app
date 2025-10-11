import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bull';
import { LoggerService } from '../../logger/logger.service';
import { ActionRegistryService } from './action-registry.service';
import { BullQueueService } from '../bull-queue.service';

export interface WorkerJobData {
  action: string;
  data?: Record<string, any>;
  entityId?: number;
  userId?: number;
}

@Injectable()
export class WorkerManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new LoggerService(WorkerManagerService.name);
  private workers: Map<string, Queue> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly actionRegistry: ActionRegistryService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Worker Manager Service initialized');
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Worker Manager Service shutting down');
  }

  /**
   * Register worker for a queue dynamically
   */
  async registerWorker(queueName: string, queue: Queue): Promise<void> {
    this.workers.set(queueName, queue);
    this.setupWorker(queueName, queue);
    this.logger.log(`👷 Registered worker for queue: ${queueName}`);
  }

  /**
   * Setup worker for a queue
   */
  private setupWorker(queueName: string, queue: Queue): void {
    queue.process('*', async (job: Job<WorkerJobData>) => {
      const { action, data, entityId, userId } = job.data;
      
      this.logger.log(`🔄 Processing ${queueName} job: ${action} (Job ID: ${job.id})`);
      
      try {
        await job.progress(10);
        await this.actionRegistry.executeAction(action, data, entityId, userId);
        await job.progress(100);
        this.logger.log(`✅ ${queueName} job completed: ${action} (Job ID: ${job.id})`);
      } catch (error) {
        this.logger.error(`❌ ${queueName} job failed: ${action} (Job ID: ${job.id}) - ${error.message}`);
        throw error;
      }
    });
  }

  /**
   * Get worker by queue name
   */
  getWorker(queueName: string): Queue | undefined {
    return this.workers.get(queueName);
  }

  /**
   * Get all workers
   */
  getAllWorkers(): Map<string, Queue> {
    return this.workers;
  }

  /**
   * Check if worker is active
   */
  isWorkerActive(queueName: string): boolean {
    return this.workers.has(queueName);
  }

  /**
   * Get worker statistics
   */
  async getWorkerStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [queueName, queue] of this.workers.entries()) {
      stats[queueName] = {
        active: true,
        queueName,
        isReady: queue.isReady(),
      };
    }
    
    return stats;
  }
}

