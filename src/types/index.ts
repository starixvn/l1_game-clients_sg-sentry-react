// Core TypeScript types and interfaces for SG-Sentry

export enum SentryLogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum WorkflowState {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Core interfaces
export interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface IConfigStorage {
  getLogLevel(): string;
  setLogLevel(level: string): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  isDebugMode(): boolean;
  setDebugMode(debugMode: boolean): void;
  getComponentLogLevel(componentName: string): string | null;
  setComponentLogLevel(componentName: string, level: string): void;
  isComponentEnabled(componentName: string): boolean;
  setComponentEnabled(componentName: string, enabled: boolean): void;
  getComponentConfig(componentName: string): ComponentConfig | null;
  setComponentConfig(componentName: string, config: ComponentConfig): void;
  getAllComponentNames(): string[];
  clear(): void;
  clearComponent(componentName: string): void;
}

export interface ILogger {
  logTrace(message: string, context?: Record<string, any>): void;
  logDebug(message: string, context?: Record<string, any>): void;
  logInfo(message: string, context?: Record<string, any>): void;
  logWarning(message: string, context?: Record<string, any>): void;
  logError(error: Error | string, context?: Record<string, any>): void;
  logFatal(error: Error | string, context?: Record<string, any>): void;
  isLoggingEnabled(level: SentryLogLevel): boolean;
}

export interface IWorkflowTracker {
  startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void;
  updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void;
  completeWorkflow(workflowId: string, success?: boolean, metadata?: Record<string, any>): void;
  trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T>;
}

export interface IConsoleOverride {
  override(): void;
  restore(): void;
  isOverridden(): boolean;
}

// Configuration types
export interface ComponentConfig {
  logLevel?: SentryLogLevel;
  enabled?: boolean;
  enableWorkflowTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableConsoleOverride?: boolean;
}

export interface WorkflowConfig {
  enabled?: boolean;
  maxWorkflows?: number;
  autoCleanup?: boolean;
}

export interface GlobalSentryConfig {
  enabled?: boolean;
  defaultLogLevel?: SentryLogLevel;
  enableWorkflowTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableConsoleOverride?: boolean;
  dsn?: string;
  environment?: string;
  release?: string;
}

export interface LocalStorageConfig {
  enabled?: boolean;
  logLevel?: SentryLogLevel;
  debugMode?: boolean;
  componentConfigs?: Record<string, ComponentConfig>;
}

export interface SentryManagerConfig {
  globalConfig?: GlobalSentryConfig;
  localStorageConfig?: LocalStorageConfig;
  storage?: IStorage;
}

export interface UseSentryHelperOptions {
  componentName: string;
  logLevel?: SentryLogLevel;
  enableWorkflowTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableConsoleOverride?: boolean;
}

// Workflow types
export interface WorkflowMetadata {
  workflowId: string;
  workflowName: string;
  componentName: string;
  startTime: number;
  state: WorkflowState;
  metadata?: Record<string, any>;
  endTime?: number;
  duration?: number;
  success?: boolean;
}

// Performance tracking types
export interface PerformanceMetrics {
  operationName: string;
  componentName: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: Error;
}

// Error context types
export interface ErrorContext {
  componentName?: string;
  workflowId?: string;
  operationName?: string;
  userData?: Record<string, any>;
  additionalData?: Record<string, any>;
} 