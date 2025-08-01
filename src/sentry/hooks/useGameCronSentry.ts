import { useCallback } from 'react';
import { useSentryHelper } from '../index';
import { SentryLogLevel } from '../core/sentry-types';

/**
 * Simple useGameCronSentry hook for backward compatibility
 * This is a simplified version that delegates to the main useSentryHelper
 */
export const useGameCronSentry = (options: {
    gameCronId: string;
    gameName: string;
    systemType: string;
    environment: string;
    onlySendOnIssues?: boolean;
} | string) => {
    const componentName = typeof options === 'string' ? options : options.gameCronId;
    const { logInfo, logError, logWarning, logDebug } = useSentryHelper({
        componentName,
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: false,
        enablePerformanceTracking: false
    });

    // Safely create callback functions with fallbacks
    let addGameCronLog: (message: string, context?: Record<string, any>) => void;
    let flushGameCronBatches: () => void;
    let getGameCronBatchStats: () => { totalLogs: number; pendingLogs: number; lastFlush: number };
    let startGameCron: (props: any) => void;
    let completeGameCron: (success: boolean, metadata?: Record<string, any>) => void;

    try {
        addGameCronLog = useCallback((message: string, context?: Record<string, any>) => {
            logInfo(message, context);
        }, [logInfo]);

        flushGameCronBatches = useCallback(() => {
            // No-op for backward compatibility
            logDebug('Game cron batches flushed', { componentName });
        }, [logDebug, componentName]);

        getGameCronBatchStats = useCallback(() => {
            // Return empty stats for backward compatibility
            return {
                totalLogs: 0,
                pendingLogs: 0,
                lastFlush: Date.now()
            };
        }, []);

        startGameCron = useCallback((props: any) => {
            logInfo('Game cron started', { props, componentName });
        }, [logInfo, componentName]);

        completeGameCron = useCallback((success: boolean, metadata?: Record<string, any>) => {
            logInfo('Game cron completed', { success, metadata, componentName });
        }, [logInfo, componentName]);
    } catch (error) {
        // Fallback if React hooks are not available
        console.warn('useGameCronSentry: useCallback not available, using fallbacks', error);
        addGameCronLog = (message: string, context?: Record<string, any>) => {
            logInfo(message, context);
        };
        flushGameCronBatches = () => {
            logDebug('Game cron batches flushed', { componentName });
        };
        getGameCronBatchStats = () => {
            return {
                totalLogs: 0,
                pendingLogs: 0,
                lastFlush: Date.now()
            };
        };
        startGameCron = (props: any) => {
            logInfo('Game cron started', { props, componentName });
        };
        completeGameCron = (success: boolean, metadata?: Record<string, any>) => {
            logInfo('Game cron completed', { success, metadata, componentName });
        };
    }

    return {
        addGameCronLog,
        flushGameCronBatches,
        getGameCronBatchStats,
        startGameCron,
        completeGameCron,
        logInfo,
        logError,
        logWarning,
        logDebug
    };
}; 