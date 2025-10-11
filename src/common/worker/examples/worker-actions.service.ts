import { Injectable, OnModuleInit } from '@nestjs/common';
import { WorkerService, WorkerTask } from '../worker.service';

@Injectable()
export class WorkerActionsService implements OnModuleInit {
  constructor(private readonly workerService: WorkerService) {}

  async onModuleInit() {
    // Register all worker actions when service starts
    this.registerWorkerActions();
  }

  private registerWorkerActions(): void {

    // 2. Image processing action
    const imageProcessingAction: WorkerTask = {
      id: 'process-image',
      name: 'Process Image',
      execute: async (data: { imagePath: string; operations: string[] }) => {
        console.log(`🖼️ Processing image: ${data.imagePath}`);
        // Simulate heavy image processing
        for (const operation of data.operations) {
          console.log(`🔧 Applying: ${operation}`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        return { success: true, processedAt: new Date().toISOString() };
      },
    };

    // 3. Data analysis action
    const dataAnalysisAction: WorkerTask = {
      id: 'analyze-data',
      name: 'Analyze Data',
      execute: async (data: { dataset: number[]; analysisType: string }) => {
        console.log(`📊 Analyzing ${data.dataset.length} data points`);
        // Simulate data analysis
        const sum = data.dataset.reduce((acc, val) => acc + val, 0);
        const average = sum / data.dataset.length;
        return { 
          success: true, 
          analysisType: data.analysisType,
          results: { sum, average, count: data.dataset.length }
        };
      },
    };

    // 4. File compression action
    const fileCompressionAction: WorkerTask = {
      id: 'compress-file',
      name: 'Compress File',
      execute: async (data: { filePath: string; compressionLevel: number }) => {
        console.log(`🗜️ Compressing file: ${data.filePath}`);
        // Simulate file compression
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { 
          success: true, 
          compressedSize: Math.round(Math.random() * 1000000),
          originalPath: data.filePath
        };
      },
    };

    // 5. Report generation action
    const reportGenerationAction: WorkerTask = {
      id: 'generate-report',
      name: 'Generate Report',
      execute: async (data: { userId: number; reportType: string; data: any }) => {
        console.log(`📋 Generating ${data.reportType} report for user ${data.userId}`);
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 3000));
        return { 
          success: true, 
          reportUrl: `/reports/${data.userId}_${data.reportType}_${Date.now()}.pdf`,
          generatedAt: new Date().toISOString()
        };
      },
    };

    // Register all actions
    this.workerService.registerTask(imageProcessingAction);
    this.workerService.registerTask(dataAnalysisAction);
    this.workerService.registerTask(fileCompressionAction);
    this.workerService.registerTask(reportGenerationAction);

    console.log('✅ All worker actions registered!');
  }

  /**
   * Execute email action
   */
  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    return this.workerService.executeTask('send-email', { to, subject, body });
  }

  /**
   * Execute image processing action
   */
  async processImage(imagePath: string, operations: string[]): Promise<any> {
    return this.workerService.executeTask('process-image', { imagePath, operations });
  }

  /**
   * Execute data analysis action
   */
  async analyzeData(dataset: number[], analysisType: string): Promise<any> {
    return this.workerService.executeTask('analyze-data', { dataset, analysisType });
  }

  /**
   * Execute file compression action
   */
  async compressFile(filePath: string, compressionLevel: number): Promise<any> {
    return this.workerService.executeTask('compress-file', { filePath, compressionLevel });
  }

  /**
   * Execute report generation action
   */
  async generateReport(userId: number, reportType: string, data: any): Promise<any> {
    return this.workerService.executeTask('generate-report', { userId, reportType, data });
  }

  /**
   * Execute any action in background
   */
  executeActionBackground(actionId: string, data: any): void {
    this.workerService.executeTaskBackground(actionId, data);
  }

  /**
   * Get all available actions
   */
  getAvailableActions(): WorkerTask[] {
    return this.workerService.getTasks();
  }
}
