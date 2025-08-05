// Standard Sentry log levels as per Sentry documentation
export enum SentryLogLevel {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
    // Legacy levels for backward compatibility
    DISABLED = 'disabled',
    ERROR_ONLY = 'error_only',
    WARNING_AND_ERROR = 'warning_and_error',
    ALL = 'all'
}

// Workflow tracking states
export enum WorkflowState {
    STARTED = 'started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

// Component tracking configuration
export interface ComponentConfig {
    name: string;
    logLevel: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
}

// Workflow tracking configuration
export interface WorkflowConfig {
    id: string;
    name: string;
    component: string;
    logLevel: SentryLogLevel;
    enablePerformanceTracking?: boolean;
    metadata?: Record<string, any>;
}

// Global Sentry configuration
export interface GlobalSentryConfig {
    enabled: boolean;
    defaultLogLevel: SentryLogLevel;
    enableWorkflowTracking: boolean;
    enablePerformanceTracking: boolean;
    enableConsoleOverride: boolean;
    componentConfigs: Map<string, ComponentConfig>;
    workflowConfigs: Map<string, WorkflowConfig>;
}

// Sentry initialization configuration
export interface SentryInitConfig {
    dsn: string;
    environment: string;
    componentName: string;
    release?: string;
    debug?: boolean;
    maxValueLength?: number;
    ignoreErrors?: Array<string | RegExp>;
}

// Local storage configuration
export interface LocalStorageConfig {
    enabled?: boolean;
    logLevel?: SentryLogLevel;
    debugMode?: boolean;
    componentLogLevels?: Record<string, SentryLogLevel>;
    componentEnabled?: Record<string, boolean>;
}

// Sentry manager configuration
export interface SentryManagerConfig {
    dsn?: string;
    environment?: string;
    release?: string;
    debug?: boolean;
    maxValueLength?: number;
    ignoreErrors?: Array<string | RegExp>;
    tracesSampleRate?: number;
    sampleRate?: number;
    beforeSend?: (event: any, hint: any) => any;
}

// Use Sentry helper options
export interface UseSentryHelperOptions {
    componentName?: string;
    logLevel?: SentryLogLevel;
    enableWorkflowTracking?: boolean;
    enablePerformanceTracking?: boolean;
    autoConfigure?: boolean;
} 