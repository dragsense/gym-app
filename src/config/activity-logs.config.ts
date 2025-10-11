import { registerAs } from '@nestjs/config';

export default registerAs('activityLogs', () => ({
  // Enable/disable activity logging
  enabled: process.env.ACTIVITY_LOGS_ENABLED === 'true' || true,
  
  // Specific endpoints to log (empty array = log all)
  logEndpoints: [
    '/api/users',
  ],
  
  // HTTP methods to log
  logMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  
  // Activity types to log
  logActivityTypes: [
    'create',
    'update', 
    'delete',
    'login',
    'logout',
    'queue_create',
    'queue_pause',
    'queue_resume',
    'queue_clean',
    'job_add',
    'job_retry',
    'job_remove',
    'job_complete',
    'job_failed',
    'action_start',
    'action_execute',
    'action_success',
    'action_error'
  ],
}));
