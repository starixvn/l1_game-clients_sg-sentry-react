import { useCallback, useMemo } from 'react';
import { SentryManager } from '../core/manager';
import { UseSentryHelperOptions, SentryLogLevel, WorkflowState } from '../types';

/**
 * React hook for easy Sentry integration
 * Provides logging, workflow tracking, and performance monitoring
 */
export function useSentry(options: UseSentryHelperOptions) {
  const { 
    componentName, 
    logLevel, 
    enableWorkflowTracking = true, 
    enablePerformanceTracking = true,
    enableConsoleOverride = false 
  } = options;

  const manager = useMemo(() => SentryManager.getInstance(), []);

  // Configure component on mount
  useMemo(() => {
    manager.configureComponent(componentName, {
      logLevel,
      enabled: true,
      enableWorkflowTracking,
      enablePerformanceTracking,
      enableConsoleOverride
    });
  }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking, enableConsoleOverride]);

  // Logging functions
  const logTrace = useCallback((message: string, context?: Record<string, any>) => {
    manager.logTrace(componentName, message, context);
  }, [manager, componentName]);

  const logDebug = useCallback((message: string, context?: Record<string, any>) => {
    manager.logDebug(componentName, message, context);
  }, [manager, componentName]);

  const logInfo = useCallback((message: string, context?: Record<string, any>) => {
    manager.logInfo(componentName, message, context);
  }, [manager, componentName]);

  const logWarning = useCallback((message: string, context?: Record<string, any>) => {
    manager.logWarning(componentName, message, context);
  }, [manager, componentName]);

  const logError = useCallback((error: Error | string, context?: Record<string, any>) => {
    manager.logError(componentName, error, context);
  }, [manager, componentName]);

  const logFatal = useCallback((error: Error | string, context?: Record<string, any>) => {
    manager.logFatal(componentName, error, context);
  }, [manager, componentName]);

  // Workflow functions
  const startWorkflow = useCallback((workflowId: string, workflowName: string, metadata?: Record<string, any>) => {
    manager.startWorkflow(workflowId, workflowName, componentName, metadata);
  }, [manager, componentName]);

  const updateWorkflow = useCallback((workflowId: string, state: WorkflowState, metadata?: Record<string, any>) => {
    manager.updateWorkflow(workflowId, state, componentName, metadata);
  }, [manager, componentName]);

  const completeWorkflow = useCallback((workflowId: string, success?: boolean, metadata?: Record<string, any>) => {
    manager.completeWorkflow(workflowId, componentName, success, metadata);
  }, [manager, componentName]);

  // Performance tracking
  const trackPerformance = useCallback(async <T>(
    operationName: string, 
    operation: () => Promise<T> | T
  ): Promise<T> => {
    return manager.trackPerformance(componentName, operationName, operation);
  }, [manager, componentName]);

  // Utility functions
  const captureError = useCallback((error: Error | string, context?: Record<string, any>) => {
    manager.captureError(error, { ...context, componentName });
  }, [manager, componentName]);

  const setLogLevel = useCallback((level: SentryLogLevel) => {
    manager.configureComponent(componentName, { logLevel: level });
  }, [manager, componentName]);

  const isEnabled = useCallback(() => {
    return manager.isEnabled();
  }, [manager]);

  return {
    // Logging
    logTrace,
    logDebug,
    logInfo,
    logWarning,
    logError,
    logFatal,
    
    // Workflow tracking
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    
    // Performance tracking
    trackPerformance,
    
    // Utilities
    captureError,
    setLogLevel,
    isEnabled,
    
    // Component info
    componentName
  };
}

/**
 * Simple hook for basic logging only
 */
export function useSimpleSentry(componentName: string) {
  return useSentry({
    componentName,
    enableWorkflowTracking: false,
    enablePerformanceTracking: false
  });
}

/**
 * Hook focused on workflow tracking
 */
export function useWorkflowSentry(componentName: string, logLevel?: SentryLogLevel) {
  return useSentry({
    componentName,
    logLevel,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true
  });
} 