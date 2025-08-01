import { ILogger, SentryLogLevel } from '../types';

/**
 * SentryLogger - Core logging implementation
 * Provides structured logging with Sentry integration
 */
export class SentryLogger implements ILogger {
  private componentName: string;
  private logLevel: SentryLogLevel;
  private isEnabled: boolean;

  constructor(componentName: string, logLevel: SentryLogLevel = SentryLogLevel.INFO) {
    this.componentName = componentName;
    this.logLevel = logLevel;
    this.isEnabled = true;
  }

  private shouldLog(level: SentryLogLevel): boolean {
    if (!this.isEnabled) return false;
    
    const levels = Object.values(SentryLogLevel);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.componentName}] ${message}${contextStr}`;
  }

  private logToSentry(level: string, message: string, context?: Record<string, any>): void {
    // Send to real Sentry SDK
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const sentry = (window as any).Sentry;
      
      try {
        if (level === 'error' || level === 'fatal') {
          sentry.captureException(new Error(message), {
            tags: { component: this.componentName, level, source: 'sg-sentry-logger' },
            extra: context
          });
        } else {
          sentry.captureMessage(message, {
            level: level as any,
            tags: { component: this.componentName, source: 'sg-sentry-logger' },
            extra: context
          });
        }
        console.log(`[SentryLogger] ${level.toUpperCase()} message sent to Sentry successfully`);
      } catch (sentryError) {
        console.error('[SentryLogger] Failed to send to Sentry:', sentryError);
      }
    } else {
      console.warn('[SentryLogger] Sentry SDK not available');
    }
  }

  logTrace(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(SentryLogLevel.TRACE)) {
      const formattedMessage = this.formatMessage('trace', message, context);
      console.trace(formattedMessage);
      this.logToSentry('debug', message, context);
    }
  }

  logDebug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(SentryLogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage('debug', message, context);
      console.debug(formattedMessage);
      this.logToSentry('debug', message, context);
    }
  }

  logInfo(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(SentryLogLevel.INFO)) {
      const formattedMessage = this.formatMessage('info', message, context);
      console.info(formattedMessage);
      this.logToSentry('info', message, context);
    }
  }

  logWarning(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(SentryLogLevel.WARNING)) {
      const formattedMessage = this.formatMessage('warning', message, context);
      console.warn(formattedMessage);
      this.logToSentry('warning', message, context);
    }
  }

  logError(error: Error | string, context?: Record<string, any>): void {
    if (this.shouldLog(SentryLogLevel.ERROR)) {
      const message = error instanceof Error ? error.message : error;
      const formattedMessage = this.formatMessage('error', message, context);
      console.error(formattedMessage);
      
      if (error instanceof Error) {
        console.error(error.stack);
      }
      
      this.logToSentry('error', message, context);
    }
  }

  logFatal(error: Error | string, context?: Record<string, any>): void {
    if (this.shouldLog(SentryLogLevel.FATAL)) {
      const message = error instanceof Error ? error.message : error;
      const formattedMessage = this.formatMessage('fatal', message, context);
      console.error(formattedMessage);
      
      if (error instanceof Error) {
        console.error(error.stack);
      }
      
      this.logToSentry('fatal', message, context);
    }
  }

  isLoggingEnabled(level: SentryLogLevel): boolean {
    return this.shouldLog(level);
  }

  setLogLevel(level: SentryLogLevel): void {
    this.logLevel = level;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  getComponentName(): string {
    return this.componentName;
  }

  getLogLevel(): SentryLogLevel {
    return this.logLevel;
  }
} 