// Core types and enums
export {
    SentryLogLevel,
    WorkflowState
} from './core/sentry-types';

export type {
    ComponentConfig,
    WorkflowConfig,
    GlobalSentryConfig,
    SentryInitConfig,
    LocalStorageConfig,
    SentryManagerConfig,
    UseSentryHelperOptions
} from './core/sentry-types';

// Core interfaces
export type {
    IStorage,
    IConfigStorage,
    ILogger,
    IWorkflowTracker,
    IConsoleOverride,
    ISentryManager,
    ISentryHelper
} from './core/interfaces';

// Core implementations
export { SentryLogger } from './core/logger/sentry-logger';
export { WorkflowTracker } from './core/workflow/workflow-tracker';
export { ConsoleOverride } from './core/console/console-override';
export { LocalStorage, SentryConfigStorage } from './core/storage/local-storage';
export { SentryManager } from './core/sentry-manager';

// Import classes for factory functions
import { SentryLogger } from './core/logger/sentry-logger';
import { WorkflowTracker } from './core/workflow/workflow-tracker';
import { ConsoleOverride } from './core/console/console-override';
import { SentryConfigStorage } from './core/storage/local-storage';
import { SentryManager } from './core/sentry-manager';
import { SentryHelper } from './utils/sentry-helper';
import { SentryLogLevel, WorkflowState } from './core/sentry-types';

// Utility classes
export { SentryHelper } from './utils/sentry-helper';

// React hooks
export {
    useSentryHelper,
    useSimpleSentry,
    useWorkflowSentry
} from './hooks/useSentryHelper';

// Factory functions for dependency injection
export const createLogger = (componentName: string, logLevel?: SentryLogLevel) =>
    new SentryLogger(componentName, logLevel);

export const createWorkflowTracker = (componentName: string) =>
    new WorkflowTracker(componentName);

export const createConfigStorage = (storage?: any) =>
    new SentryConfigStorage(storage);

export const createConsoleOverride = (logger: any) =>
    new ConsoleOverride(logger);

export const createSentryManager = () => SentryManager.getInstance();
export const createSentryHelper = () => SentryHelper.getInstance();

// Singleton instances
export const sentryManager = createSentryManager();
export const sentryHelper = createSentryHelper();

// Convenience functions for easy usage
export const configureSentry = (config?: any) => sentryHelper.initialize(config);
export const enableSentry = () => sentryHelper.setGlobalEnabled(true);
export const disableSentry = () => sentryHelper.setGlobalEnabled(false);
export const setLogLevel = (level: SentryLogLevel) => sentryHelper.setDefaultLogLevel(level);
export const configureComponent = (name: string, config: any) => sentryHelper.configureComponent(name, config);

// Workflow convenience functions
export const startWorkflow = (id: string, name: string, component: string, metadata?: Record<string, any>) =>
    sentryHelper.startWorkflow(id, name, component, metadata);
export const updateWorkflow = (id: string, state: WorkflowState, metadata?: Record<string, any>) =>
    sentryHelper.updateWorkflow(id, state, metadata);
export const completeWorkflow = (id: string, success?: boolean, metadata?: Record<string, any>) =>
    sentryHelper.completeWorkflow(id, success, metadata);
export const trackPerformance = (component: string, operation: string, fn: () => Promise<any> | any) =>
    sentryHelper.trackPerformance(component, operation, fn);

// Logging convenience functions
export const logTrace = (componentName: string, message: string, context?: Record<string, any>) => 
    sentryHelper.logTrace(componentName, message, context);
export const logDebug = (componentName: string, message: string, context?: Record<string, any>) => 
    sentryHelper.logDebug(componentName, message, context);
export const logInfo = (componentName: string, message: string, context?: Record<string, any>) => 
    sentryHelper.logInfo(componentName, message, context);
export const logWarning = (componentName: string, message: string, context?: Record<string, any>) => 
    sentryHelper.logWarning(componentName, message, context);
export const logError = (componentName: string, error: Error | string, context?: Record<string, any>) => 
    sentryHelper.logError(componentName, error, context);
export const logFatal = (componentName: string, error: Error | string, context?: Record<string, any>) => 
    sentryHelper.logError(componentName, error, context); // Using logError for fatal as well

// Utility functions
export const isLoggingEnabled = (componentName: string, level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') => 
    sentryHelper.isLoggingEnabled(componentName, level);
export const getComponentConfig = (componentName: string) => sentryHelper.getComponentConfig(componentName);
export const getConfig = () => sentryHelper.getConfig();
export const getActiveWorkflows = () => sentryHelper.getActiveWorkflows();
export const cleanup = () => sentryHelper.cleanup();
export const resetLogger = () => SentryHelper.resetInstance();
export const resetManager = () => SentryManager.resetInstance();

// Manager convenience functions
export const configureSentryManager = (config: any) => sentryManager.initialize(config);
export const enableSentryManager = () => sentryManager.setLocalStorageConfig({ enabled: true });
export const disableSentryManager = () => sentryManager.setLocalStorageConfig({ enabled: false });
export const setSentryLogLevel = (level: SentryLogLevel) => sentryManager.setLocalStorageConfig({ logLevel: level });
export const startSentryWorkflow = (id: string, name: string, metadata?: any) => sentryManager.startWorkflow(id, name, metadata);
export const updateSentryWorkflow = (id: string, state: WorkflowState, metadata?: any) => sentryManager.updateWorkflow(id, state, metadata);
export const completeSentryWorkflow = (id: string, success?: boolean, metadata?: any) => sentryManager.completeWorkflow(id, success, metadata);
export const trackSentryPerformance = (operation: string, fn: () => any) => sentryManager.trackPerformance(operation, fn);
export const setLocalStorageConfig = (config: any) => sentryManager.setLocalStorageConfig(config);
export const clearLocalStorageConfig = () => sentryManager.clearLocalStorageConfig();
export const captureError = (error: Error | string, context?: any) => sentryManager.captureError(error, context);

// Legacy exports for backward compatibility
// Note: These are already exported above 