import { ISentryHelper } from '../core/interfaces';
import { SentryLogger } from '../core/logger/sentry-logger';
import { WorkflowTracker } from '../core/workflow/workflow-tracker';
import { SentryConfigStorage } from '../core/storage/local-storage';
import { SentryLogLevel, WorkflowState, GlobalSentryConfig, ComponentConfig } from '../core/sentry-types';

export class SentryHelper implements ISentryHelper {
    private static instance: SentryHelper | null = null;
    private globalConfig: GlobalSentryConfig;
    private componentConfigs: Map<string, ComponentConfig>;
    private activeWorkflows: Map<string, { config: any; startTime: number; metadata: Record<string, any> }>;
    private isInitialized = false;
    private sentryUrl = "";
    private env = "";
    private identifier = "";
    private loaded = false;

    private constructor() {
        this.globalConfig = {
            enabled: true,
            defaultLogLevel: SentryLogLevel.INFO,
            enableWorkflowTracking: true,
            enablePerformanceTracking: true,
            enableConsoleOverride: true,
            componentConfigs: new Map(),
            workflowConfigs: new Map()
        };
        this.activeWorkflows = new Map();
        this.componentConfigs = new Map();
    }

    static getInstance(): SentryHelper {
        if (!SentryHelper.instance) {
            SentryHelper.instance = new SentryHelper();
        }
        return SentryHelper.instance;
    }

    static resetInstance(): void {
        if (SentryHelper.instance) {
            SentryHelper.instance.cleanup();
        }
        SentryHelper.instance = null;
    }

    initialize(config?: Partial<GlobalSentryConfig>): void {
        if (config) {
            this.globalConfig = { ...this.globalConfig, ...config };
        }
        this.isInitialized = true;
        console.log('SentryHelper initialized with config:', this.globalConfig);
    }

    setGlobalEnabled(enabled: boolean): void {
        this.globalConfig.enabled = enabled;
    }

    setDefaultLogLevel(level: SentryLogLevel): void {
        this.globalConfig.defaultLogLevel = level;
    }

    configureComponent(componentName: string, config: Partial<ComponentConfig>): void {
        const existingConfig = this.componentConfigs.get(componentName);
        const baseConfig = {
            name: componentName,
            logLevel: this.globalConfig?.defaultLogLevel || SentryLogLevel.INFO,
            enableWorkflowTracking: this.globalConfig?.enableWorkflowTracking || false,
            enablePerformanceTracking: this.globalConfig?.enablePerformanceTracking || false
        };

        const mergedConfig = existingConfig ? { ...existingConfig, ...config } : { ...baseConfig, ...config };
        this.componentConfigs.set(componentName, mergedConfig);
    }

    getComponentConfig(componentName: string): ComponentConfig | undefined {
        const config = this.componentConfigs.get(componentName);
        if (config) {
            return config;
        }

        return {
            name: componentName,
            logLevel: this.globalConfig?.defaultLogLevel || SentryLogLevel.INFO,
            enableWorkflowTracking: this.globalConfig?.enableWorkflowTracking || false,
            enablePerformanceTracking: this.globalConfig?.enablePerformanceTracking || false
        };
    }

    isLoggingEnabled(componentName: string, level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): boolean {
        if (!this.globalConfig || !this.globalConfig.enabled) return false;

        const componentConfig = this.getComponentConfig(componentName);
        const logLevel = componentConfig?.logLevel || this.globalConfig.defaultLogLevel || SentryLogLevel.INFO;

        const levelHierarchy = {
            'trace': 0,
            'debug': 1,
            'info': 2,
            'warn': 3,
            'error': 4,
            'fatal': 5
        };

        switch (logLevel) {
            case SentryLogLevel.DISABLED:
                return false;
            case SentryLogLevel.TRACE:
                return levelHierarchy[level] >= levelHierarchy['trace'];
            case SentryLogLevel.DEBUG:
                return levelHierarchy[level] >= levelHierarchy['debug'];
            case SentryLogLevel.INFO:
                return levelHierarchy[level] >= levelHierarchy['info'];
            case SentryLogLevel.WARN:
                return levelHierarchy[level] >= levelHierarchy['warn'];
            case SentryLogLevel.ERROR:
                return levelHierarchy[level] >= levelHierarchy['error'];
            case SentryLogLevel.FATAL:
                return levelHierarchy[level] >= levelHierarchy['fatal'];
            case SentryLogLevel.ERROR_ONLY:
                return level === 'error' || level === 'fatal';
            case SentryLogLevel.WARNING_AND_ERROR:
                return level === 'warn' || level === 'error' || level === 'fatal';
            case SentryLogLevel.ALL:
                return true;
            default:
                return false;
        }
    }

    startWorkflow(id: string, name: string, component: string, metadata?: Record<string, any>): void {
        if (!this.globalConfig || !this.globalConfig.enableWorkflowTracking) return;

        const workflowConfig = {
            id,
            name,
            component,
            logLevel: this.getComponentConfig(component)?.logLevel || this.globalConfig.defaultLogLevel || SentryLogLevel.INFO,
            enablePerformanceTracking: this.globalConfig.enablePerformanceTracking || false,
            metadata
        };

        this.globalConfig.workflowConfigs.set(id, workflowConfig);
        this.activeWorkflows.set(id, {
            config: workflowConfig,
            startTime: performance.now(),
            metadata: metadata || {}
        });

        this.logInfo(component, `Workflow started: ${name}`, {
            workflowId: id,
            workflowName: name,
            state: WorkflowState.STARTED,
            metadata
        });
    }

    updateWorkflow(id: string, state: WorkflowState, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(id);
        if (!workflow) {
            console.warn(`Workflow ${id} not found for update`);
            return;
        }

        const { config } = workflow;
        const updatedMetadata = { ...workflow.metadata, ...metadata };

        this.activeWorkflows.set(id, {
            ...workflow,
            metadata: updatedMetadata
        });

        this.logInfo(config.component, `Workflow updated: ${config.name}`, {
            workflowId: id,
            workflowName: config.name,
            state,
            metadata: updatedMetadata
        });
    }

    completeWorkflow(id: string, success: boolean = true, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(id);
        if (!workflow) {
            console.warn(`Workflow ${id} not found for completion`);
            return;
        }

        const { config } = workflow;
        const finalMetadata = { ...workflow.metadata, ...metadata };
        const duration = performance.now() - workflow.startTime;

        this.activeWorkflows.delete(id);
        this.globalConfig.workflowConfigs.delete(id);

        const state = success ? WorkflowState.COMPLETED : WorkflowState.FAILED;
        this.logInfo(config.component, `Workflow completed: ${config.name}`, {
            workflowId: id,
            workflowName: config.name,
            state,
            duration,
            success,
            metadata: finalMetadata
        });
    }

    async trackPerformance(component: string, operation: string, fn: () => Promise<any> | any): Promise<any> {
        if (!this.globalConfig || !this.globalConfig.enablePerformanceTracking) {
            return Promise.resolve(fn());
        }

        const startTime = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - startTime;
            this.logInfo(component, `Performance tracked: ${operation}`, {
                operationName: operation,
                duration,
                success: true
            });
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            this.logError(component, `Performance tracked: ${operation} failed`, {
                operationName: operation,
                duration,
                success: false,
                error
            });
            throw error;
        }
    }

    logTrace(component: string, message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(component, 'trace')) return;
        this.captureMessage(component, message, 'trace', context);
    }

    logDebug(component: string, message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(component, 'debug')) return;
        this.captureMessage(component, message, 'debug', context);
    }

    logInfo(component: string, message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(component, 'info')) return;
        this.captureMessage(component, message, 'info', context);
    }

    logWarning(component: string, message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(component, 'warn')) return;
        this.captureMessage(component, message, 'warning', context);
    }

    logError(component: string, error: Error | string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(component, 'error')) return;
        this.captureError(component, error, context);
    }

    updateSentryConfiguration(dsn?: string, environment?: string): void {
        if (dsn) this.sentryUrl = dsn;
        if (environment) this.env = environment;
    }

    private captureMessage(componentName: string, message: string, level: string, context?: Record<string, any>): void {
        if (!this.isEnabled() || !(globalThis as any).Sentry) return;

        (globalThis as any).Sentry.setExtra('component', componentName);
        (globalThis as any).Sentry.setExtra('context', context);
        (globalThis as any).Sentry.setTag('component', componentName);
        (globalThis as any).Sentry.setTag('logLevel', level);
        (globalThis as any).Sentry.captureMessage(`[${this.identifier}] [${componentName}] ${message}`, level);
    }

    private captureError(componentName: string, error: Error | string, context?: Record<string, any>, level: string = 'error'): void {
        if (!this.isEnabled() || !(globalThis as any).Sentry) return;

        (globalThis as any).Sentry.setExtra('component', componentName);
        (globalThis as any).Sentry.setExtra('context', context);
        (globalThis as any).Sentry.setTag('component', componentName);
        (globalThis as any).Sentry.setTag('logLevel', level);

        if (typeof error === 'string') {
            (globalThis as any).Sentry.captureMessage(`[${this.identifier}] [${componentName}] ${error}`, level);
        } else {
            (globalThis as any).Sentry.captureException(error);
        }
    }

    private isEnabled(): boolean {
        if (typeof document !== "undefined") {
            return this.globalConfig.enabled && !!this.sentryUrl && !!document?.head;
        }
        return this.globalConfig.enabled;
    }

    getConfig(): GlobalSentryConfig {
        return { ...this.globalConfig };
    }

    getActiveWorkflows(): Map<string, { config: any; startTime: number; metadata: Record<string, any> }> {
        return new Map(this.activeWorkflows);
    }

    cleanup(): void {
        if (this.activeWorkflows) {
            this.activeWorkflows.clear();
        }
        if (this.componentConfigs) {
            this.componentConfigs.clear();
        }
        if (this.globalConfig) {
            if (this.globalConfig.componentConfigs) {
                this.globalConfig.componentConfigs.clear();
            }
            if (this.globalConfig.workflowConfigs) {
                this.globalConfig.workflowConfigs.clear();
            }
        }
        this.isInitialized = false;
        console.log('SentryHelper cleaned up');
    }
} 