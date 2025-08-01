import { IWorkflowTracker, WorkflowState, WorkflowMetadata, PerformanceMetrics } from '../types';

/**
 * WorkflowTracker - Tracks complex workflows and performance metrics
 */
export class WorkflowTracker implements IWorkflowTracker {
  private componentName: string;
  private workflows: Map<string, WorkflowMetadata> = new Map();
  private maxWorkflows: number = 100;
  private autoCleanup: boolean = true;

  constructor(componentName: string, maxWorkflows: number = 100, autoCleanup: boolean = true) {
    this.componentName = componentName;
    this.maxWorkflows = maxWorkflows;
    this.autoCleanup = autoCleanup;
  }

  startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void {
    const workflow: WorkflowMetadata = {
      workflowId,
      workflowName,
      componentName: this.componentName,
      startTime: Date.now(),
      state: WorkflowState.STARTED,
      metadata
    };

    this.workflows.set(workflowId, workflow);
    
    if (this.autoCleanup && this.workflows.size > this.maxWorkflows) {
      this.cleanupOldWorkflows();
    }

    console.log(`[Workflow] Started: ${workflowName} (${workflowId})`, { component: this.componentName, metadata });
  }

  updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      console.warn(`[Workflow] Workflow not found: ${workflowId}`);
      return;
    }

    workflow.state = state as WorkflowState;
    if (metadata) {
      workflow.metadata = { ...workflow.metadata, ...metadata };
    }

    console.log(`[Workflow] Updated: ${workflow.workflowName} (${workflowId}) - ${state}`, { 
      component: this.componentName, 
      metadata: workflow.metadata 
    });
  }

  completeWorkflow(workflowId: string, success: boolean = true, metadata?: Record<string, any>): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      console.warn(`[Workflow] Workflow not found: ${workflowId}`);
      return;
    }

    workflow.endTime = Date.now();
    workflow.duration = workflow.endTime - workflow.startTime;
    workflow.success = success;
    workflow.state = success ? WorkflowState.COMPLETED : WorkflowState.FAILED;
    
    if (metadata) {
      workflow.metadata = { ...workflow.metadata, ...metadata };
    }

    console.log(`[Workflow] Completed: ${workflow.workflowName} (${workflowId}) - ${success ? 'SUCCESS' : 'FAILED'}`, {
      component: this.componentName,
      duration: workflow.duration,
      metadata: workflow.metadata
    });

    // Remove completed workflows if auto-cleanup is enabled
    if (this.autoCleanup) {
      this.workflows.delete(workflowId);
    }
  }

  async trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T> {
    const startTime = Date.now();
    const workflowId = `${this.componentName}-${operationName}-${Date.now()}`;
    
    this.startWorkflow(workflowId, operationName, { operation: operationName });
    
    try {
      const result = await operation();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const metrics: PerformanceMetrics = {
        operationName,
        componentName: this.componentName,
        startTime,
        endTime,
        duration,
        success: true
      };

      this.completeWorkflow(workflowId, true, { metrics });
      
      if (duration > 1000) { // Log slow operations
        console.warn(`[Performance] Slow operation detected: ${operationName} took ${duration}ms`, {
          component: this.componentName,
          metrics
        });
      }
      
      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const metrics: PerformanceMetrics = {
        operationName,
        componentName: this.componentName,
        startTime,
        endTime,
        duration,
        success: false,
        error: error as Error
      };

      this.completeWorkflow(workflowId, false, { metrics, error });
      
      console.error(`[Performance] Operation failed: ${operationName}`, {
        component: this.componentName,
        duration,
        error,
        metrics
      });
      
      throw error;
    }
  }

  getWorkflow(workflowId: string): WorkflowMetadata | undefined {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows(): WorkflowMetadata[] {
    return Array.from(this.workflows.values());
  }

  getActiveWorkflows(): WorkflowMetadata[] {
    return Array.from(this.workflows.values()).filter(
      w => w.state === WorkflowState.STARTED || w.state === WorkflowState.IN_PROGRESS
    );
  }

  getCompletedWorkflows(): WorkflowMetadata[] {
    return Array.from(this.workflows.values()).filter(
      w => w.state === WorkflowState.COMPLETED || w.state === WorkflowState.FAILED
    );
  }

  cleanupOldWorkflows(): void {
    const workflows = Array.from(this.workflows.entries());
    const completedWorkflows = workflows.filter(([_, w]) => 
      w.state === WorkflowState.COMPLETED || w.state === WorkflowState.FAILED
    );
    
    // Remove oldest completed workflows
    const toRemove = completedWorkflows
      .sort((a, b) => (a[1].endTime || 0) - (b[1].endTime || 0))
      .slice(0, Math.max(0, this.workflows.size - this.maxWorkflows));
    
    toRemove.forEach(([id]) => this.workflows.delete(id));
    
    if (toRemove.length > 0) {
      console.log(`[Workflow] Cleaned up ${toRemove.length} old workflows`);
    }
  }

  clear(): void {
    this.workflows.clear();
  }

  setMaxWorkflows(max: number): void {
    this.maxWorkflows = max;
  }

  setAutoCleanup(enabled: boolean): void {
    this.autoCleanup = enabled;
  }
} 