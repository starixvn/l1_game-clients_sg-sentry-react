// SG-Sentry - Main export file
// Clean, organized exports for better maintainability

// Core types and interfaces
export * from './types';

// Core implementations
export { SentryManager } from './core/manager';
export { SentryLogger } from './core/logger';
export { WorkflowTracker } from './core/workflow';
export { SentryConfigStorage, LocalStorage } from './core/storage';

// React hooks
export { useSentry, useSimpleSentry, useWorkflowSentry } from './hooks/useSentry';

// Convenience functions for global usage
import { SentryManager } from './core/manager';
import { SentryLogLevel, WorkflowState } from './types';

// Global manager instance
const sentryManager = SentryManager.getInstance();

// Configuration functions
export const configureSentry = (config?: any) => sentryManager.initialize(config);
export const enableSentry = () => sentryManager.setLocalStorageConfig({ enabled: true });
export const disableSentry = () => sentryManager.setLocalStorageConfig({ enabled: false });
export const setSentryLogLevel = (level: SentryLogLevel) => sentryManager.setLocalStorageConfig({ logLevel: level });

// Logging functions
export const logTrace = (component: string, message: string, context?: any) =>
    sentryManager.logTrace(component, message, context);
export const logDebug = (component: string, message: string, context?: any) =>
    sentryManager.logDebug(component, message, context);
export const logInfo = (component: string, message: string, context?: any) =>
    sentryManager.logInfo(component, message, context);
export const logWarning = (component: string, message: string, context?: any) =>
    sentryManager.logWarning(component, message, context);
export const logError = (component: string, error: Error | string, context?: any) =>
    sentryManager.logError(component, error, context);
export const logFatal = (component: string, error: Error | string, context?: any) =>
    sentryManager.logFatal(component, error, context);

// Workflow functions
export const startWorkflow = (id: string, name: string, component: string, metadata?: any) =>
    sentryManager.startWorkflow(id, name, component, metadata);
export const updateWorkflow = (id: string, state: WorkflowState, component: string, metadata?: any) =>
    sentryManager.updateWorkflow(id, state, component, metadata);
export const completeWorkflow = (id: string, component: string, success?: boolean, metadata?: any) =>
    sentryManager.completeWorkflow(id, component, success, metadata);

// Performance tracking
export const trackPerformance = (component: string, operation: string, fn: () => any) =>
    sentryManager.trackPerformance(component, operation, fn);

// Configuration management
export const configureComponent = (name: string, config: any) =>
    sentryManager.configureComponent(name, config);
export const getComponentConfig = (name: string) =>
    sentryManager.getComponentConfig(name);
export const getAllComponentNames = () =>
    sentryManager.getAllComponentNames();

// Error capture
export const captureError = (error: Error | string, context?: any) =>
    sentryManager.captureError(error, context);

// Utility functions
export const isSentryEnabled = () => sentryManager.isEnabled();
export const clearSentryConfig = () => sentryManager.clearLocalStorageConfig();

