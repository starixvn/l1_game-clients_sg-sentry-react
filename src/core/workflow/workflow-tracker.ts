import { IWorkflowTracker } from '../interfaces';
import { SentryLogger } from '../logger/sentry-logger';
import { SentryLogLevel } from '../sentry-types';

export class WorkflowTracker implements IWorkflowTracker {
    private componentName: string;
    private logger: SentryLogger;
    private activeWorkflows: Map<string, { name: string; startTime: number; metadata: Record<string, any> }>;

    constructor(componentName: string) {
        this.componentName = componentName;
        this.logger = new SentryLogger(componentName);
        this.activeWorkflows = new Map();
    }

    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void {
        this.activeWorkflows.set(workflowId, {
            name: workflowName,
            startTime: performance.now(),
            metadata: metadata || {}
        });

        this.logger.logInfo(`Workflow started: ${workflowName}`, {
            workflowId,
            workflowName,
            state: 'started',
            metadata
        });
    }

    updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            console.warn(`Workflow ${workflowId} not found for update`);
            return;
        }

        const updatedMetadata = { ...workflow.metadata, ...metadata };
        this.activeWorkflows.set(workflowId, {
            ...workflow,
            metadata: updatedMetadata
        });

        this.logger.logInfo(`Workflow updated: ${workflow.name}`, {
            workflowId,
            workflowName: workflow.name,
            state,
            metadata: updatedMetadata
        });
    }

    completeWorkflow(workflowId: string, success: boolean = true, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            console.warn(`Workflow ${workflowId} not found for completion`);
            return;
        }

        const finalMetadata = { ...workflow.metadata, ...metadata };
        const duration = performance.now() - workflow.startTime;

        this.activeWorkflows.delete(workflowId);

        const state = success ? 'completed' : 'failed';
        this.logger.logInfo(`Workflow completed: ${workflow.name}`, {
            workflowId,
            workflowName: workflow.name,
            state,
            duration,
            success,
            metadata: finalMetadata
        });
    }

    async trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T> {
        const startTime = performance.now();
        
        try {
            const result = await operation();
            const duration = performance.now() - startTime;
            
            this.logger.logInfo(`Performance tracked: ${operationName}`, {
                operationName,
                duration,
                success: true
            });
            
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            
            this.logger.logError(`Performance tracked: ${operationName} failed`, {
                operationName,
                duration,
                success: false,
                error
            });
            
            throw error;
        }
    }

    getActiveWorkflows(): Map<string, { name: string; startTime: number; metadata: Record<string, any> }> {
        return new Map(this.activeWorkflows);
    }

    clearWorkflows(): void {
        this.activeWorkflows.clear();
    }
} 