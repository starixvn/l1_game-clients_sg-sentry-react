import { IConsoleOverride, ILogger } from '../interfaces';

export class ConsoleOverride implements IConsoleOverride {
    private logger: ILogger;
    private isOverriddenFlag: boolean = false;
    private originalConsoleError: typeof console.error;
    private originalConsoleWarn: typeof console.warn;
    private originalConsoleInfo: typeof console.info;
    private originalConsoleDebug: typeof console.debug;
    private originalConsoleTrace: typeof console.trace;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;
        this.originalConsoleInfo = console.info;
        this.originalConsoleDebug = console.debug;
        this.originalConsoleTrace = console.trace;
    }

    override(): void {
        if (this.isOverriddenFlag) return;

        // Override console.trace
        console.trace = (...args: any[]) => {
            this.originalConsoleTrace(...args);
            const message = this.formatMessage(args);
            this.logger.logTrace(message);
        };

        // Override console.debug
        console.debug = (...args: any[]) => {
            this.originalConsoleDebug(...args);
            const message = this.formatMessage(args);
            this.logger.logDebug(message);
        };

        // Override console.info
        console.info = (...args: any[]) => {
            this.originalConsoleInfo(...args);
            const message = this.formatMessage(args);
            this.logger.logInfo(message);
        };

        // Override console.warn
        console.warn = (...args: any[]) => {
            this.originalConsoleWarn(...args);
            const message = this.formatMessage(args);
            this.logger.logWarning(message);
        };

        // Override console.error
        console.error = (...args: any[]) => {
            this.originalConsoleError(...args);
            const message = this.formatMessage(args);
            this.logger.logError(message);
        };

        this.isOverriddenFlag = true;
    }

    restore(): void {
        if (!this.isOverriddenFlag) return;

        console.error = this.originalConsoleError;
        console.warn = this.originalConsoleWarn;
        console.info = this.originalConsoleInfo;
        console.debug = this.originalConsoleDebug;
        console.trace = this.originalConsoleTrace;

        this.isOverriddenFlag = false;
    }

    isOverridden(): boolean {
        return this.isOverriddenFlag;
    }

    private formatMessage(args: any[]): string {
        return args.map(arg => {
            if (typeof arg === 'string') {
                return arg;
            }
            if (arg instanceof Error) {
                return arg.message;
            }
            if (arg && typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
    }
} 