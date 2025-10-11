import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.gaurd';
import { BullQueueService } from './bull-queue.service';
import { WorkerManagerService } from './services/worker-manager.service';
import { ActionRegistryService } from './services/action-registry.service';
import { LoggerService } from '../logger/logger.service';
import { QueueListDto, QueueListPaginatedDto, JobListDto, JobPaginatedDto } from 'shared/dtos/queue-dtos';

@ApiTags('Queue Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/queues')
export class QueueController {
  private readonly logger = new LoggerService(QueueController.name);

  constructor(
    private readonly bullQueueService: BullQueueService,
    private readonly actionRegistry: ActionRegistryService,
  ) {}

  /**
   * Get all queues with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all queues with pagination and filtering' })
  @ApiQuery({ type: QueueListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of queues',
    type: QueueListPaginatedDto,
  })
  async getAllQueues(@Query() queryDto: QueueListDto) {
    this.logger.log('📋 Getting all queues with pagination');
    
    return await this.bullQueueService.getQueuesPaginated(queryDto);
  }

  /**
   * Get jobs from a specific queue with pagination
   */
  @Get('jobs/:queueName')
  @ApiOperation({ summary: 'Get jobs from queue with pagination' })
  @ApiQuery({ type: JobListDto })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully',
    type: JobPaginatedDto,
  })
  async getJobs(
    @Param('queueName') queueName: string,
    @Query() queryDto: JobListDto,
  ) {
    this.logger.log(`📋 Getting jobs from queue: ${queueName}`);
    
    const result = await this.bullQueueService.getJobsPaginated(queueName, queryDto);
    
    return {
      ...result,
      data: result.data.map(job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress(),
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        status: job.opts.delay ? 'delayed' : 'waiting',
      })),
    };
  }


  /**
   * Pause a queue
   */
  @Put('pause/:queueName')
  @ApiOperation({ summary: 'Pause queue' })
  @ApiResponse({ status: 200, description: 'Queue paused successfully' })
  async pauseQueue(@Param('queueName') queueName: string) {
    this.logger.log(`⏸️ Pausing queue: ${queueName}`);
    
    await this.bullQueueService.pauseQueue(queueName);
    
    return {
      success: true,
      message: `Queue ${queueName} paused`,
    };
  }

  /**
   * Resume a queue
   */
  @Put('resume/:queueName')
  @ApiOperation({ summary: 'Resume queue' })
  @ApiResponse({ status: 200, description: 'Queue resumed successfully' })
  async resumeQueue(@Param('queueName') queueName: string) {
    this.logger.log(`▶️ Resuming queue: ${queueName}`);
    
    await this.bullQueueService.resumeQueue(queueName);
    
    return {
      success: true,
      message: `Queue ${queueName} resumed`,
    };
  }

  /**
   * Retry a failed job
   */
  @Put('jobs/:queueName/:jobId/retry')
  @ApiOperation({ summary: 'Retry failed job' })
  @ApiResponse({ status: 200, description: 'Job retried successfully' })
  async retryJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    this.logger.log(`🔄 Retrying job: ${jobId} in queue: ${queueName}`);
    
    await this.bullQueueService.retryJob(queueName, jobId);
    
    return {
      success: true,
      message: `Job ${jobId} retried`,
    };
  }

  /**
   * Clean completed and failed jobs
   */
  @Delete(':queueName/clean')
  @ApiOperation({ summary: 'Clean completed and failed jobs' })
  @ApiResponse({ status: 200, description: 'Queue cleaned successfully' })
  async cleanQueue(
    @Param('queueName') queueName: string,
    @Query('grace') grace: number = 0,
  ) {
    this.logger.log(`🧹 Cleaning queue: ${queueName}`);
    
    await this.bullQueueService.cleanQueue(queueName, grace);
    
    return {
      success: true,
      message: `Queue ${queueName} cleaned`,
    };
  }
}