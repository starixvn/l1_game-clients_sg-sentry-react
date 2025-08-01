import { useCallback } from 'react';
import { useSentryHelper } from '../index';
import { SentryLogLevel } from '../core/sentry-types';

/**
 * Simple useSessionReplay hook for backward compatibility
 * This is a simplified version that delegates to the main useSentryHelper
 */
export const useSessionReplay = (componentName: string) => {
    const { logInfo, logError, logWarning } = useSentryHelper({
        componentName,
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Safely create callback functions with fallbacks
    let startReplay: (sessionName?: string, metadata?: Record<string, any>) => void;
    let trackInteraction: (action: string, context?: Record<string, any>) => void;
    let trackError: (error: string | Error, context?: Record<string, any>) => void;
    let trackPerformance: (operation: string, duration: number, context?: Record<string, any>) => void;
    let setUser: (user: any) => void;
    let setTags: (tags: Record<string, any>) => void;
    let stopReplay: () => void;
    let addData: (data: Record<string, any>) => void;
    let trackLifecycle: (lifecycle: 'mount' | 'unmount' | 'update', data?: Record<string, any>) => void;

    try {
        startReplay = useCallback((sessionName?: string, metadata?: Record<string, any>) => {
            logInfo(`Session replay started: ${sessionName || 'default'}`, metadata);
        }, [logInfo]);

        trackInteraction = useCallback((action: string, context?: Record<string, any>) => {
            logInfo(`Session replay interaction: ${action}`, context);
        }, [logInfo]);

        trackError = useCallback((error: string | Error, context?: Record<string, any>) => {
            logError(error, context);
        }, [logError]);

        trackPerformance = useCallback((operation: string, duration: number, context?: Record<string, any>) => {
            logInfo(`Session replay performance: ${operation}`, { duration, ...context });
        }, [logInfo]);

        setUser = useCallback((user: any) => {
            logInfo('Session replay user set', { user });
        }, [logInfo]);

        setTags = useCallback((tags: Record<string, any>) => {
            logInfo('Session replay tags set', { tags });
        }, [logInfo]);

        stopReplay = useCallback(() => {
            logInfo('Session replay stopped');
        }, [logInfo]);

        addData = useCallback((data: Record<string, any>) => {
            logInfo('Session replay data added', { data });
        }, [logInfo]);

        trackLifecycle = useCallback((lifecycle: 'mount' | 'unmount' | 'update', data?: Record<string, any>) => {
            logInfo(`Session replay lifecycle: ${lifecycle}`, data);
        }, [logInfo]);
    } catch (error) {
        // Fallback if React hooks are not available
        console.warn('useSessionReplay: useCallback not available, using fallbacks', error);
        startReplay = (sessionName?: string, metadata?: Record<string, any>) => {
            logInfo(`Session replay started: ${sessionName || 'default'}`, metadata);
        };
        trackInteraction = (action: string, context?: Record<string, any>) => {
            logInfo(`Session replay interaction: ${action}`, context);
        };
        trackError = (error: string | Error, context?: Record<string, any>) => {
            logError(error, context);
        };
        trackPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
            logInfo(`Session replay performance: ${operation}`, { duration, ...context });
        };
        setUser = (user: any) => {
            logInfo('Session replay user set', { user });
        };
        setTags = (tags: Record<string, any>) => {
            logInfo('Session replay tags set', { tags });
        };
        stopReplay = () => {
            logInfo('Session replay stopped');
        };
        addData = (data: Record<string, any>) => {
            logInfo('Session replay data added', { data });
        };
        trackLifecycle = (lifecycle: 'mount' | 'unmount' | 'update', data?: Record<string, any>) => {
            logInfo(`Session replay lifecycle: ${lifecycle}`, data);
        };
    }

    return {
        startReplay,
        stopReplay,
        trackInteraction,
        trackError,
        trackPerformance,
        trackLifecycle,
        setUser,
        setTags,
        addData,
        isRecording: false, // Backward compatibility
        sessionId: componentName // Backward compatibility
    };
}; 