import { SentryLogLevel, WorkflowState } from '../sentry-types';

// Storage interface for dependency injection
export interface IStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}

// Configuration storage interface
export interface IConfigStorage {
    getLogLevel(): string;
    setLogLevel(level: string): void;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    isDebugMode(): boolean;
    setDebugMode(debugMode: boolean): void;
    getComponentLogLevel(componentName: string): string | null;
    setComponentLogLevel(componentName: string, level: string): void;
    isComponentEnabled(componentName: string): boolean;
    setComponentEnabled(componentName: string, enabled: boolean): void;
    clear(): void;
    clearComponent(componentName: string): void;
}

// Logger interface
export interface ILogger {
    logTrace(message: string, context?: Record<string, any>): void;
    logDebug(message: string, context?: Record<string, any>): void;
    logInfo(message: string, context?: Record<string, any>): void;
    logWarning(message: string, context?: Record<string, any>): void;
    logError(error: Error | string, context?: Record<string, any>): void;
    logFatal(error: Error | string, context?: Record<string, any>): void;
    isLoggingEnabled(level: SentryLogLevel): boolean;
}

// Workflow tracker interface
export interface IWorkflowTracker {
    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void;
    updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void;
    completeWorkflow(workflowId: string, success?: boolean, metadata?: Record<string, any>): void;
    trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T>;
}

// Console override interface
export interface IConsoleOverride {
    override(): void;
    restore(): void;
    isOverridden(): boolean;
}

// Sentry manager interface
export interface ISentryManager {
    initialize(config?: any): void;
    setLocalStorageConfig(config: any): void;
    clearLocalStorageConfig(): void;
    startWorkflow(id: string, name: string, metadata?: any): void;
    updateWorkflow(id: string, state: WorkflowState, metadata?: any): void;
    completeWorkflow(id: string, success?: boolean, metadata?: any): void;
    trackPerformance(operation: string, fn: () => any): Promise<any>;
    captureError(error: Error | string, context?: any): void;
}

// Sentry helper interface
export interface ISentryHelper {
    initialize(config?: any): void;
    setGlobalEnabled(enabled: boolean): void;
    setDefaultLogLevel(level: SentryLogLevel): void;
    configureComponent(name: string, config: any): void;
    startWorkflow(id: string, name: string, component: string, metadata?: any): void;
    updateWorkflow(id: string, state: WorkflowState, metadata?: any): void;
    completeWorkflow(id: string, success?: boolean, metadata?: any): void;
    trackPerformance(component: string, operation: string, fn: () => any): Promise<any>;
    logError(component: string, error: any, context?: any): void;
    logWarning(component: string, warning: string, context?: any): void;
    logInfo(component: string, info: string, context?: any): void;
    logDebug(component: string, debug: string, context?: any): void;
    logTrace(component: string, trace: string, context?: any): void;
    updateSentryConfiguration(dsn?: string, environment?: string): void;
} 