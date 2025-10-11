import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Job, JobOptions } from 'bull';
import { LoggerService } from '../logger/logger.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { EActivityType, EActivityStatus } from 'shared/enums/activity-log.enum';
import * as Bull from 'bull';
import { WorkerManagerService } from './services/worker-manager.service';
import { QueueListDto, JobListDto } from 'shared/dtos/queue-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CreateQueueDto, CreateJobDto } from './dtos';

export interface JobData {
  action: string;
  data?: Record<string, any>;
  entityId?: number;
  userId?: number;
}

export interface QueueJobOptions extends JobOptions {
  delay?: number;
  priority?: number;
  removeOnComplete?: number;
  removeOnFail?: number;
  attempts?: number;
}

@Injectable()
export class BullQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new LoggerService(BullQueueService.name);
  private queues: Map<string, Queue> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly workerManager: WorkerManagerService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Log activity for queue operations
   */
  private async logActivity(
    type: EActivityType,
    description: string,
    status: EActivityStatus,
    metadata?: Record<string, any>,
    userId?: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      const activityData: any = {
        description,
        type,
        status,
        metadata,
        errorMessage,
      };
      
      if (userId) {
        activityData.userId = userId;
      }
      
      await this.activityLogsService.create(activityData);
    } catch (error) {
      this.logger.error(`Failed to log activity: ${error.message}`);
    }
  }

  async onModuleInit() {
    this.logger.log('🚀 BullQueueService initialized');
    this.setupEventListeners();
  }

  async onModuleDestroy() {
    this.logger.log('🛑 BullQueueService shutting down');
    await this.closeAllQueues();
  }


  /**
   * Create a new queue dynamically
   */
  async createQueue(createQueueDto: CreateQueueDto): Promise<Queue> {
    try {
      const dragonflyConfig = this.configService.get('bullQueue.dragonfly');
      
      const queue = new Bull(createQueueDto.name, {
        redis: dragonflyConfig,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          ...createQueueDto.options,
        },
      });

      this.queues.set(createQueueDto.name, queue);
      await this.workerManager.registerWorker(createQueueDto.name, queue);
      this.logger.log(`📝 Created new dynamic queue: ${createQueueDto.name}`);
      
      // Log activity
      await this.logActivity(
        EActivityType.QUEUE_CREATE,
        `Created queue: ${createQueueDto.name}`,
        EActivityStatus.SUCCESS,
        { queueName: createQueueDto.name, options: createQueueDto.options },
        createQueueDto.userId
      );
      
      return queue;
    } catch (error) {
      this.logger.error(`Failed to create queue ${createQueueDto.name}: ${error.message}`);
      
      // Log failed activity
      await this.logActivity(
        EActivityType.QUEUE_CREATE,
        `Failed to create queue: ${createQueueDto.name}`,
        EActivityStatus.FAILED,
        { queueName: createQueueDto.name, options: createQueueDto.options },
        createQueueDto.userId,
        error.message
      );
      
      throw error;
    }
  }

  private setupEventListeners() {
    for (const [name, queue] of this.queues.entries()) {
      queue.on('completed', async (job: Job) => {
        this.logger.log(`✅ Job completed: ${job.id} in queue ${name}`);
        
        // Log job completion activity
        await this.logActivity(
          EActivityType.JOB_COMPLETE,
          `Job completed: ${job.id} in queue: ${name}`,
          EActivityStatus.SUCCESS,
          { 
            queueName: name, 
            jobId: job.id, 
            jobName: job.name,
            jobData: job.data,
            duration: job.processedOn ? Date.now() - job.processedOn : undefined
          },
          job.data?.userId
        );
      });

      queue.on('failed', async (job: Job, err: Error) => {
        this.logger.error(`❌ Job failed: ${job.id} in queue ${name} - ${err.message}`);
        
        // Log job failure activity
        await this.logActivity(
          EActivityType.JOB_FAILED,
          `Job failed: ${job.id} in queue: ${name}`,
          EActivityStatus.FAILED,
          { 
            queueName: name, 
            jobId: job.id, 
            jobName: job.name,
            jobData: job.data,
            duration: job.processedOn ? Date.now() - job.processedOn : undefined,
            attempts: job.attemptsMade
          },
          job.data?.userId,
          err.message
        );
      });

      queue.on('stalled', (job: Job) => {
        this.logger.warn(`⚠️ Job stalled: ${job.id} in queue ${name}`);
      });

      queue.on('progress', (job: Job, progress: number) => {
        this.logger.log(`📊 Job progress: ${job.id} in queue ${name} - ${progress}%`);
      });
    }
  }

  /**
   * Add a job to a specific queue
   */
  async addJob(createJobDto: CreateJobDto): Promise<Job> {
    try {
      const queue = this.queues.get(createJobDto.queueName);
      if (!queue) {
        throw new Error(`Queue ${createJobDto.queueName} not found`);
      }

      const jobData: JobData = {
        action: createJobDto.action,
        data: createJobDto.data,
        entityId: createJobDto.entityId,
        userId: createJobDto.userId,
      };

      const jobOptions: JobOptions = {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        ...createJobDto.options,
      };

      const job = await queue.add(createJobDto.jobName, jobData, jobOptions);
      this.logger.log(`📝 Added job: ${job.id} to queue ${createJobDto.queueName}`);
      
      // Log activity
      await this.logActivity(
        EActivityType.JOB_ADD,
        `Added job: ${createJobDto.jobName} to queue: ${createJobDto.queueName}`,
        EActivityStatus.SUCCESS,
        { 
          queueName: createJobDto.queueName, 
          jobName: createJobDto.jobName, 
          jobId: job.id, 
          action: jobData.action,
          entityId: jobData.entityId,
          userId: jobData.userId,
          options: createJobDto.options
        },
        createJobDto.userId
      );
      
      return job;
    } catch (error) {
      this.logger.error(`Failed to add job to queue ${createJobDto.queueName}: ${error.message}`);
      
      // Log failed activity
      await this.logActivity(
        EActivityType.JOB_ADD,
        `Failed to add job: ${createJobDto.jobName} to queue: ${createJobDto.queueName}`,
        EActivityStatus.FAILED,
        { 
          queueName: createJobDto.queueName, 
          jobName: createJobDto.jobName, 
          action: createJobDto.action, 
          options: createJobDto.options 
        },
        createJobDto.userId,
        error.message
      );
      
      throw error;
    }
  }

  /**
   * Get job by ID from a queue
   */
  async getJob(queueName: string, jobId: string): Promise<Job | undefined> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    return queue.getJob(jobId);
  }

  /**
   * Get all jobs from a queue
   */
  async getJobs(queueName: string, status?: string): Promise<Job[]> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    if (status) {
      return queue.getJobs([status as any]);
    }
    return queue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
  }

  /**
   * Get jobs with database-level pagination
   */
  async getJobsPaginated(
    queueName: string, 
    queryDto: JobListDto
  ): Promise<IPaginatedResponse<Job>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      status,
      ...filters
    } = queryDto;

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    // Get all jobs first (Bull doesn't have built-in pagination)
    let jobs: Job[];
    if (status) {
      jobs = await queue.getJobs([status as any]);
    } else {
      jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
    }

    // Apply search filter
    if (search) {
      jobs = jobs.filter(job => 
        job.name?.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(job.data).toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        jobs = jobs.filter(job => {
          const jobValue = job[key as keyof Job];
          return jobValue === value;
        });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdOn';
    const sortDirection = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    jobs.sort((a, b) => {
      const aVal = a[sortColumn as keyof Job];
      const bVal = b[sortColumn as keyof Job];
      
      if (sortDirection === 'ASC') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    const total = jobs.length;
    const lastPage = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedJobs = jobs.slice(startIndex, endIndex);

    return {
      data: paginatedJobs,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Get queues with pagination
   */
  async getQueuesPaginated(queryDto: QueueListDto): Promise<IPaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      status,
      ...filters
    } = queryDto;

    const queueNames = this.getQueueNames();
    let queues: any[] = [];
    
    for (const queueName of queueNames) {
      const stats = await this.getQueueStats(queueName);
      const queue = this.getQueue(queueName);
      
      queues.push({
        name: queueName,
        stats,
        isReady: queue?.isReady() || false,
      });
    }

    // Apply search filter
    if (search) {
      queues = queues.filter(queue => 
        queue.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status) {
      queues = queues.filter(queue => {
        const queueStatus = queue.isReady ? 'active' : 'inactive';
        return queueStatus === status;
      });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queues = queues.filter(queue => queue[key] === value);
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'name';
    const sortDirection = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queues.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (sortDirection === 'ASC') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    const total = queues.length;
    const lastPage = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedQueues = queues.slice(startIndex, endIndex);

    return {
      data: paginatedQueues,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: string, userId?: number): Promise<void> {
    try {
      const queue = this.queues.get(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }
      await queue.pause();
      this.logger.log(`⏸️ Queue ${queueName} paused`);
      
      // Log activity
      await this.logActivity(
        EActivityType.QUEUE_PAUSE,
        `Paused queue: ${queueName}`,
        EActivityStatus.SUCCESS,
        { queueName },
        userId
      );
    } catch (error) {
      this.logger.error(`Failed to pause queue ${queueName}: ${error.message}`);
      
      // Log failed activity
      await this.logActivity(
        EActivityType.QUEUE_PAUSE,
        `Failed to pause queue: ${queueName}`,
        EActivityStatus.FAILED,
        { queueName },
        userId,
        error.message
      );
      
      throw error;
    }
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: string, userId?: number): Promise<void> {
    try {
      const queue = this.queues.get(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }
      await queue.resume();
      this.logger.log(`▶️ Queue ${queueName} resumed`);
      
      // Log activity
      await this.logActivity(
        EActivityType.QUEUE_RESUME,
        `Resumed queue: ${queueName}`,
        EActivityStatus.SUCCESS,
        { queueName },
        userId
      );
    } catch (error) {
      this.logger.error(`Failed to resume queue ${queueName}: ${error.message}`);
      
      // Log failed activity
      await this.logActivity(
        EActivityType.QUEUE_RESUME,
        `Failed to resume queue: ${queueName}`,
        EActivityStatus.FAILED,
        { queueName },
        userId,
        error.message
      );
      
      throw error;
    }
  }


  /**
   * Retry a failed job
   */
  async retryJob(queueName: string, jobId: string, userId?: number): Promise<void> {
    try {
      const job = await this.getJob(queueName, jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found in queue ${queueName}`);
      }
      await job.retry();
      this.logger.log(`🔄 Job ${jobId} retried`);
      
      // Log activity
      await this.logActivity(
        EActivityType.JOB_RETRY,
        `Retried job: ${jobId} in queue: ${queueName}`,
        EActivityStatus.SUCCESS,
        { queueName, jobId },
        userId
      );
    } catch (error) {
      this.logger.error(`Failed to retry job ${jobId} in queue ${queueName}: ${error.message}`);
      
      // Log failed activity
      await this.logActivity(
        EActivityType.JOB_RETRY,
        `Failed to retry job: ${jobId} in queue: ${queueName}`,
        EActivityStatus.FAILED,
        { queueName, jobId },
        userId,
        error.message
      );
      
      throw error;
    }
  }

  /**
   * Remove a job
   */
  async removeJob(queueName: string, jobId: string, userId?: number): Promise<void> {
    try {
      const job = await this.getJob(queueName, jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found in queue ${queueName}`);
      }
      await job.remove();
      this.logger.log(`🗑️ Job ${jobId} removed`);
      
      // Log activity
      await this.logActivity(
        EActivityType.JOB_REMOVE,
        `Removed job: ${jobId} from queue: ${queueName}`,
        EActivityStatus.SUCCESS,
        { queueName, jobId },
        userId
      );
    } catch (error) {
      this.logger.error(`Failed to remove job ${jobId} from queue ${queueName}: ${error.message}`);
      
      // Log failed activity
      await this.logActivity(
        EActivityType.JOB_REMOVE,
        `Failed to remove job: ${jobId} from queue: ${queueName}`,
        EActivityStatus.FAILED,
        { queueName, jobId },
        userId,
        error.message
      );
      
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();
    const delayed = await queue.getDelayed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  }

  /**
   * Clean completed and failed jobs
   */
  async cleanQueue(queueName: string, grace: number = 0, userId?: number): Promise<void> {
    try {
      const queue = this.queues.get(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }
      await queue.clean(grace, 'completed');
      await queue.clean(grace, 'failed');
      this.logger.log(`🧹 Queue ${queueName} cleaned`);
      
      // Log activity
      await this.logActivity(
        EActivityType.QUEUE_CLEAN,
        `Cleaned queue: ${queueName}`,
        EActivityStatus.SUCCESS,
        { queueName, grace },
        userId
      );
    } catch (error) {
      this.logger.error(`Failed to clean queue ${queueName}: ${error.message}`);
      
      // Log failed activity
      await this.logActivity(
        EActivityType.QUEUE_CLEAN,
        `Failed to clean queue: ${queueName}`,
        EActivityStatus.FAILED,
        { queueName, grace },
        userId,
        error.message
      );
      
      throw error;
    }
  }

  /**
   * Get all queue names
   */
  getQueueNames(): string[] {
    return Array.from(this.queues.keys());
  }

  /**
   * Close all queues
   */
  private async closeAllQueues(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.log(`🔒 Queue ${name} closed`);
    }
  }


  /**
   * Get queue instance
   */
  getQueue(queueName: string): Queue | undefined {
    return this.queues.get(queueName);
  }
}