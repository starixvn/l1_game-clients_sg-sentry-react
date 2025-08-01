import { ISentryManager } from './interfaces';
import { SentryLogger } from './logger/sentry-logger';
import { WorkflowTracker } from './workflow/workflow-tracker';
import { ConsoleOverride } from './console/console-override';
import { SentryConfigStorage } from './storage/local-storage';
import { SentryLogLevel, WorkflowState, SentryManagerConfig, LocalStorageConfig } from './sentry-types';

declare global {
    interface Window {
        Sentry: any;
    }
}

export class SentryManager implements ISentryManager {
    private static instance: SentryManager | null = null;
    private logger: SentryLogger;
    private workflowTracker: WorkflowTracker;
    private consoleOverride: ConsoleOverride;
    private configStorage: SentryConfigStorage;
    private isInitialized: boolean = false;
    private sentryUrl: string = '';
    private environment: string = '';
    private identifier: string = '';
    private loaded: boolean = false;

    private constructor() {
        this.logger = new SentryLogger('SentryManager');
        this.workflowTracker = new WorkflowTracker('SentryManager');
        this.consoleOverride = new ConsoleOverride(this.logger);
        this.configStorage = new SentryConfigStorage();
    }

    static getInstance(): SentryManager {
        if (!SentryManager.instance) {
            SentryManager.instance = new SentryManager();
        }
        return SentryManager.instance;
    }

    static resetInstance(): void {
        if (SentryManager.instance) {
            SentryManager.instance.cleanup();
        }
        SentryManager.instance = null;
    }

    initialize(config?: SentryManagerConfig): void {
        if (this.isInitialized) return;

        if (config) {
            this.sentryUrl = config.dsn || '';
            this.environment = config.environment || '';
            this.identifier = 'SG-Sentry';
        }

        this.isInitialized = true;
        this.logger.logInfo('SentryManager initialized', { config });
    }

    setLocalStorageConfig(config: LocalStorageConfig): void {
        if (config.enabled !== undefined) {
            this.configStorage.setEnabled(config.enabled);
        }
        if (config.logLevel !== undefined) {
            this.configStorage.setLogLevel(config.logLevel);
        }
        if (config.debugMode !== undefined) {
            this.configStorage.setDebugMode(config.debugMode);
        }
        if (config.componentLogLevels) {
            Object.entries(config.componentLogLevels).forEach(([component, level]) => {
                this.configStorage.setComponentLogLevel(component, level);
            });
        }
        if (config.componentEnabled) {
            Object.entries(config.componentEnabled).forEach(([component, enabled]) => {
                this.configStorage.setComponentEnabled(component, enabled);
            });
        }
    }

    clearLocalStorageConfig(): void {
        this.configStorage.clear();
    }

    startWorkflow(id: string, name: string, metadata?: any): void {
        this.workflowTracker.startWorkflow(id, name, metadata);
    }

    updateWorkflow(id: string, state: WorkflowState, metadata?: any): void {
        this.workflowTracker.updateWorkflow(id, state, metadata);
    }

    completeWorkflow(id: string, success?: boolean, metadata?: any): void {
        this.workflowTracker.completeWorkflow(id, success, metadata);
    }

    async trackPerformance(operation: string, fn: () => any): Promise<any> {
        return this.workflowTracker.trackPerformance(operation, fn);
    }

    captureError(error: Error | string, context?: any): void {
        this.logger.logError(error, context);
    }

    // Load Sentry script and initialize
    loadScript(): void {
        if ((globalThis as any).Sentry && !this.loaded) {
            (globalThis as any).Sentry.init({
                dsn: this.sentryUrl,
                environment: this.environment,
                maxValueLength: 5000,
                debug: process.env.NODE_ENV === 'development',
                release: process.env.TAG_VERSION || process.env.npm_package_version,
                tracesSampleRate: 0.1,
                sampleRate: 1.0,
                beforeSend: (event: any, hint: any) => {
                    event.tags = {
                        ...event.tags,
                        component: this.identifier,
                        version: process.env.TAG_VERSION || process.env.npm_package_version || 'unknown'
                    };
                    return event;
                }
            });

            (globalThis as any).Sentry.setTag("sg-sentry", this.identifier);
            this.loaded = true;

            // Override console methods if enabled
            if (this.configStorage.isEnabled()) {
                this.consoleOverride.override();
            }
        }
    }

    // Start Sentry with configuration
    start(sentryUrl: string = '', env: string = '', identifier: string = ''): void {
        try {
            if (!sentryUrl) {
                return;
            }
            this.sentryUrl = sentryUrl;
            this.environment = env;
            this.identifier = identifier;

            if (typeof document !== "undefined") {
                const sentryScript = document?.createElement("script");
                if (sentryScript) {
                    sentryScript.setAttribute("id", "sg-sentry-logger");
                    sentryScript.src = "https://browser.sentry-cdn.com/7.0.0/bundle.min.js";
                    sentryScript.integrity = "sha384-...";
                    sentryScript.crossOrigin = "anonymous";
                    sentryScript.onload = () => {
                        this.loadScript();
                    };
                    document.head.appendChild(sentryScript);
                }
            }
        } catch (error) {
            console.error('Failed to start Sentry:', error);
        }
    }

    isEnabled(): boolean {
        return this.configStorage.isEnabled() && this.isInitialized;
    }

    getConfig(): any {
        return {
            isInitialized: this.isInitialized,
            sentryUrl: this.sentryUrl,
            environment: this.environment,
            identifier: this.identifier,
            loaded: this.loaded
        };
    }

    cleanup(): void {
        this.consoleOverride.restore();
        this.workflowTracker.clearWorkflows();
        this.isInitialized = false;
        this.loaded = false;
        this.logger.logInfo('SentryManager cleaned up');
    }
} 