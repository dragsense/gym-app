export interface ActionHandler {
    handler: (data?: any, entityId?: number, userId?: number) => Promise<any>;
    description?: string;
    retryable?: boolean;
    timeout?: number;
  }
  
  export interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime?: number;
  }