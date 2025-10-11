// Utils
import { BaseService } from "./base.service";

// Types
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IQueue, IQueueJob } from "@shared/interfaces";

// Constants
const QUEUE_API_PATH = "/queues";

// Create base service instance for queues
const queueService = new BaseService<IQueue, any, any>(QUEUE_API_PATH);

// Re-export common operations
export const fetchQueues = (params: IListQueryParams) => queueService.get(params);

// Queue Management APIs (custom methods)
export const pauseQueue = (queueName: string) =>
    queueService.post({}, undefined, `/${queueName}/pause`);

export const resumeQueue = (queueName: string) =>
    queueService.post({}, undefined, `/${queueName}/resume`);

export const cleanQueue = (queueName: string, grace: number = 0) =>
    queueService.post({}, { grace }, `/${queueName}/clean`);

// Job Management APIs
export const fetchJobs = (queueName: string, params: IListQueryParams) =>
    queueService.get<IQueueJob>(params, `/jobs/${queueName}`);

export const fetchJob = (queueName: string, jobId: string) =>
    queueService.getSingle<IQueueJob>(jobId, undefined, `/${queueName}/jobs`);

export const retryJob = (queueName: string, jobId: string) =>
    queueService.post({}, undefined, `/${queueName}/jobs/${jobId}/retry`);

export const removeJob = (queueName: string, jobId: string) =>
    queueService.delete(null, undefined, `/${queueName}/jobs/${jobId}`);