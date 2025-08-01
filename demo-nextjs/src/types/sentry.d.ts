// Sentry SDK types for global window object
declare global {
    interface Window {
        Sentry: {
            init: (config: any) => void;
            captureException: (error: Error, context?: any) => void;
            captureMessage: (message: string, context?: any) => void;
            getCurrentHub: () => {
                getClient: () => any;
            };
        };
        SGSentry: {
            configure: (config: any) => void;
            logTrace: (component: string, message: string, context?: any) => void;
            logDebug: (component: string, message: string, context?: any) => void;
            logInfo: (component: string, message: string, context?: any) => void;
            logWarning: (component: string, message: string, context?: any) => void;
            logError: (component: string, error: Error | string, context?: any) => void;
            logFatal: (component: string, error: Error | string, context?: any) => void;
            captureError: (error: Error | string, context?: any) => void;
            startWorkflow: (id: string, name: string, component: string, metadata?: any) => void;
            updateWorkflow: (id: string, state: string, component: string, metadata?: any) => void;
            completeWorkflow: (id: string, component: string, success?: boolean, metadata?: any) => void;
            trackPerformance: (component: string, operation: string, fn: () => any) => Promise<any>;
        };
    }
}

export {}; 