import { ILogger } from '../interfaces';
import { SentryLogLevel } from '../sentry-types';

declare global {
    interface Window {
        Sentry: any;
    }
}

export class SentryLogger implements ILogger {
    private componentName: string;
    private logLevel: SentryLogLevel;
    private identifier: string;

    constructor(componentName: string, logLevel: SentryLogLevel = SentryLogLevel.INFO, identifier: string = 'SG-Sentry') {
        this.componentName = componentName;
        this.logLevel = logLevel;
        this.identifier = identifier;
    }



    private captureMessage(message: string, level: string, context?: Record<string, any>): void {
        if (!this.isEnabled() || !(globalThis as any).Sentry) return;

        (globalThis as any).Sentry.setExtra('component', this.componentName);
        (globalThis as any).Sentry.setExtra('context', context);
        (globalThis as any).Sentry.setTag('component', this.componentName);
        (globalThis as any).Sentry.setTag('logLevel', level);
        (globalThis as any).Sentry.captureMessage(`[${this.identifier}] [${this.componentName}] ${message}`, level);
    }

    private captureError(error: Error | string, context?: Record<string, any>, level: string = 'error'): void {
        if (!this.isEnabled() || !(globalThis as any).Sentry) return;

        (globalThis as any).Sentry.setExtra('component', this.componentName);
        (globalThis as any).Sentry.setExtra('context', context);
        (globalThis as any).Sentry.setTag('component', this.componentName);
        (globalThis as any).Sentry.setTag('logLevel', level);

        if (typeof error === 'string') {
            (globalThis as any).Sentry.captureMessage(`[${this.identifier}] [${this.componentName}] ${error}`, level);
        } else {
            (globalThis as any).Sentry.captureException(error);
        }
    }

    private isEnabled(): boolean {
        return typeof (globalThis as any).Sentry !== 'undefined' && (globalThis as any).Sentry !== null;
    }

    logTrace(message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(SentryLogLevel.TRACE)) return;
        this.captureMessage(message, 'trace', context);
    }

    logDebug(message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(SentryLogLevel.DEBUG)) return;
        this.captureMessage(message, 'debug', context);
    }

    logInfo(message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(SentryLogLevel.INFO)) return;
        this.captureMessage(message, 'info', context);
    }

    logWarning(message: string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(SentryLogLevel.WARN)) return;
        this.captureMessage(message, 'warning', context);
    }

    logError(error: Error | string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(SentryLogLevel.ERROR)) return;
        this.captureError(error, context, 'error');
    }

    logFatal(error: Error | string, context?: Record<string, any>): void {
        if (!this.isLoggingEnabled(SentryLogLevel.FATAL)) return;
        this.captureError(error, context, 'fatal');
    }

    isLoggingEnabled(level: SentryLogLevel): boolean {
        // Define level hierarchy (higher number = more important)
        const levelHierarchy: Record<string, number> = {
            [SentryLogLevel.TRACE]: 0,
            [SentryLogLevel.DEBUG]: 1,
            [SentryLogLevel.INFO]: 2,
            [SentryLogLevel.WARN]: 3,
            [SentryLogLevel.ERROR]: 4,
            [SentryLogLevel.FATAL]: 5
        };

        const currentLevel = levelHierarchy[this.logLevel] || 2;
        const requestedLevel = levelHierarchy[level] || 2;

        return requestedLevel >= currentLevel;
    }

    setLogLevel(level: SentryLogLevel): void {
        this.logLevel = level;
    }

    getLogLevel(): SentryLogLevel {
        return this.logLevel;
    }

    setComponentName(name: string): void {
        this.componentName = name;
    }

    getComponentName(): string {
        return this.componentName;
    }
} 