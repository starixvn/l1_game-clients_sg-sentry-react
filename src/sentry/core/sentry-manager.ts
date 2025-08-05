import * as Sentry from '@sentry/react';
import { ILogger, IWorkflowTracker, IConsoleOverride, IConfigStorage } from './interfaces';
import { SentryLogger } from './logger/sentry-logger';
import { WorkflowTracker } from './workflow/workflow-tracker';
import { ConsoleOverride } from './console/console-override';
import { SentryConfigStorage } from './storage/local-storage';
import {
    SentryLogLevel,
    WorkflowState,
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    SentryManagerConfig
} from './sentry-types';

/**
 * SentryManager that follows SOLID principles
 * - Single Responsibility: Orchestrates different services
 * - Open/Closed: Extensible through dependency injection
 * - Liskov Substitution: Uses interfaces
 * - Interface Segregation: Uses specific interfaces
 * - Dependency Inversion: Depends on abstractions
 */
export class SentryManager {
    private static instance: SentryManager;
    private isInitialized = false;
    private componentName = '';
    private logger: ILogger;
    private workflowTracker: IWorkflowTracker;
    private consoleOverride: IConsoleOverride;
    private configStorage: IConfigStorage;
    private componentConfig?: ComponentConfig;

    private constructor(
        logger: ILogger,
        workflowTracker: IWorkflowTracker,
        consoleOverride: IConsoleOverride,
        configStorage: IConfigStorage
    ) {
        this.logger = logger;
        this.workflowTracker = workflowTracker;
        this.consoleOverride = consoleOverride;
        this.configStorage = configStorage;
    }

    static getInstance(): SentryManager {
        if (!SentryManager.instance) {
            const configStorage = new SentryConfigStorage();
            const logger = new SentryLogger('default');
            const workflowTracker = new WorkflowTracker('default');
            const consoleOverride = new ConsoleOverride(logger);

            SentryManager.instance = new SentryManager(
                logger,
                workflowTracker,
                consoleOverride,
                configStorage
            );
        }
        return SentryManager.instance;
    }

    initialize(config: SentryManagerConfig): void {
        if (this.isInitialized) {
            this.logger.logWarning('SentryManager already initialized');
            return;
        }

        try {
            // Initialize Sentry with proper error capturing
            Sentry.init({
                dsn: config.dsn,
                environment: config.environment,
                release: config.release,
                debug: config.debug || false,
                // Enable beforeSend to filter events
                beforeSend(event: any, hint: any) {
                    // Log the event for debugging
                    console.log('Sentry event captured:', event);
                    return event;
                },
                // Enable beforeBreadcrumb to filter breadcrumbs
                beforeBreadcrumb(breadcrumb: any, hint: any) {
                    return breadcrumb;
                }
            });

            this.componentName = config.componentName;

            // Update logger with component name
            (this.logger as SentryLogger).setLogLevel(config.logLevel || SentryLogLevel.ERROR);

            // Configure component
            this.componentConfig = {
                name: config.componentName,
                logLevel: config.logLevel || SentryLogLevel.ERROR,
                enableWorkflowTracking: config.enableWorkflowTracking ?? true,
                enablePerformanceTracking: config.enablePerformanceTracking ?? true
            };

            this.isInitialized = true;
            this.logger.logInfo('SentryManager initialized successfully', { config: this.componentConfig });
        } catch (error) {
            console.error('Failed to initialize SentryManager:', error);
            throw error;
        }
    }

    // Logging methods
    logTrace(message: string, context?: Record<string, any>): void {
        this.logger.logTrace(message, context);
    }

    logDebug(message: string, context?: Record<string, any>): void {
        this.logger.logDebug(message, context);
    }

    logInfo(message: string, context?: Record<string, any>): void {
        this.logger.logInfo(message, context);
    }

    logWarning(message: string, context?: Record<string, any>): void {
        this.logger.logWarning(message, context);
    }

    logError(error: Error | string, context?: Record<string, any>): void {
        this.logger.logError(error, context);
    }

    logFatal(error: Error | string, context?: Record<string, any>): void {
        this.logger.logFatal(error, context);
    }

    captureError(error: Error | string, context?: Record<string, any>): void {
        try {
            if (typeof error === 'string') {
                Sentry.captureMessage(error, 'error');
            } else {
                Sentry.captureException(error);
            }
            this.logger.logError(error, context);
        } catch (sentryError) {
            console.error('Failed to capture error in Sentry:', sentryError);
        }
    }

    // Workflow methods
    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void {
        this.workflowTracker.startWorkflow(workflowId, workflowName, metadata);
    }

    updateWorkflow(workflowId: string, state: WorkflowState, metadata?: Record<string, any>): void {
        this.workflowTracker.updateWorkflow(workflowId, state, metadata);
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        this.workflowTracker.completeWorkflow(workflowId, success, metadata);
    }

    async trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T> {
        return this.workflowTracker.trackPerformance(operationName, operation);
    }

    // Configuration methods
    configureComponent(config: Partial<ComponentConfig>): void {
        if (!this.componentConfig) {
            this.componentConfig = {
                name: this.componentName,
                logLevel: SentryLogLevel.ERROR,
                enableWorkflowTracking: true,
                enablePerformanceTracking: true
            };
        }

        this.componentConfig = { ...this.componentConfig, ...config };

        // Update logger level
        if (config.logLevel) {
            (this.logger as SentryLogger).setLogLevel(config.logLevel);
        }

        this.logger.logInfo('Component configured', { config: this.componentConfig });
    }

    getComponentConfig(): ComponentConfig | undefined {
        return this.componentConfig;
    }

    isLoggingEnabled(level: SentryLogLevel): boolean {
        return this.logger.isLoggingEnabled(level);
    }

    // Storage methods
    setLocalStorageConfig(config: { logLevel?: string; enabled?: boolean; debugMode?: boolean }): void {
        if (config.logLevel) this.configStorage.setLogLevel(config.logLevel);
        if (config.enabled !== undefined) this.configStorage.setEnabled(config.enabled);
        if (config.debugMode !== undefined) this.configStorage.setDebugMode(config.debugMode);
    }

    clearLocalStorageConfig(): void {
        this.configStorage.clear();
    }

    // Utility methods
    getComponentName(): string {
        return this.componentName;
    }

    isManagerInitialized(): boolean {
        return this.isInitialized;
    }

    cleanup(): void {
        this.isInitialized = false;
        this.componentConfig = undefined;
        this.componentName = '';
        this.logger.logInfo('SentryManager cleaned up');
    }

    close(): void {
        try {
            Sentry.close();
            this.cleanup();
        } catch (error) {
            console.error('Failed to close Sentry:', error);
        }
    }
} 