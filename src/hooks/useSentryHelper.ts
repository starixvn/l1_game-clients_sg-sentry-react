import { useEffect, useCallback, useMemo } from 'react';
import { SentryHelper } from '../utils/sentry-helper';
import { SentryLogLevel, WorkflowState, UseSentryHelperOptions } from '../core/sentry-types';

export const useSentryHelper = (options: UseSentryHelperOptions = {}) => {
    const {
        componentName = 'UnknownComponent',
        logLevel = SentryLogLevel.INFO,
        enableWorkflowTracking = true,
        enablePerformanceTracking = true,
        autoInitialize = true
    } = options;

    const sentryHelper = useMemo(() => SentryHelper.getInstance(), []);

    useEffect(() => {
        if (autoInitialize) {
            sentryHelper.configureComponent(componentName, {
                logLevel,
                enableWorkflowTracking,
                enablePerformanceTracking
            });
        }
    }, [componentName, logLevel, enableWorkflowTracking, enablePerformanceTracking, autoInitialize, sentryHelper]);

    const logTrace = useCallback((message: string, context?: Record<string, any>) => {
        sentryHelper.logTrace(componentName, message, context);
    }, [componentName, sentryHelper]);

    const logDebug = useCallback((message: string, context?: Record<string, any>) => {
        sentryHelper.logDebug(componentName, message, context);
    }, [componentName, sentryHelper]);

    const logInfo = useCallback((message: string, context?: Record<string, any>) => {
        sentryHelper.logInfo(componentName, message, context);
    }, [componentName, sentryHelper]);

    const logWarning = useCallback((message: string, context?: Record<string, any>) => {
        sentryHelper.logWarning(componentName, message, context);
    }, [componentName, sentryHelper]);

    const logError = useCallback((error: Error | string, context?: Record<string, any>) => {
        sentryHelper.logError(componentName, error, context);
    }, [componentName, sentryHelper]);

    const startWorkflow = useCallback((id: string, name: string, metadata?: Record<string, any>) => {
        sentryHelper.startWorkflow(id, name, componentName, metadata);
    }, [componentName, sentryHelper]);

    const updateWorkflow = useCallback((id: string, state: WorkflowState, metadata?: Record<string, any>) => {
        sentryHelper.updateWorkflow(id, state, metadata);
    }, [sentryHelper]);

    const completeWorkflow = useCallback((id: string, success?: boolean, metadata?: Record<string, any>) => {
        sentryHelper.completeWorkflow(id, success, metadata);
    }, [sentryHelper]);

    const trackPerformance = useCallback(async <T>(operation: string, fn: () => Promise<T> | T): Promise<T> => {
        return sentryHelper.trackPerformance(componentName, operation, fn);
    }, [componentName, sentryHelper]);

    const isLoggingEnabled = useCallback((level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') => {
        return sentryHelper.isLoggingEnabled(componentName, level);
    }, [componentName, sentryHelper]);

    // Create workflowTracker object for backward compatibility
    const workflowTracker = {
        start: (name: string, metadata?: Record<string, any>) => {
            const workflowId = `${componentName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sentryHelper.startWorkflow(workflowId, name, componentName, metadata);
            return workflowId;
        },
        update: updateWorkflow,
        complete: completeWorkflow,
        track: trackPerformance
    };

    return {
        logTrace,
        logDebug,
        logInfo,
        logWarning,
        logError,
        startWorkflow,
        updateWorkflow,
        completeWorkflow,
        trackPerformance,
        isLoggingEnabled,
        sentryHelper,
        workflowTracker // Add workflowTracker for backward compatibility
    };
};

export const useSimpleSentry = (componentName: string = 'UnknownComponent') => {
    return useSentryHelper({ componentName, autoInitialize: false });
};

export const useWorkflowSentry = (componentName: string = 'UnknownComponent') => {
    return useSentryHelper({
        componentName,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });
}; 