import { 
  SentryManagerConfig, 
  GlobalSentryConfig, 
  LocalStorageConfig, 
  ComponentConfig,
  SentryLogLevel,
  WorkflowState,
  IStorage,
  ILogger,
  IWorkflowTracker,
  IConfigStorage
} from '../types';
import { SentryLogger } from './logger';
import { WorkflowTracker } from './workflow';
import { SentryConfigStorage, LocalStorage } from './storage';

/**
 * SentryManager - Main orchestrator for Sentry functionality
 * Manages logging, workflow tracking, and configuration
 */
export class SentryManager {
  private static instance: SentryManager;
  
  private configStorage: IConfigStorage;
  private globalConfig: GlobalSentryConfig;
  private componentLoggers: Map<string, ILogger> = new Map();
  private workflowTrackers: Map<string, IWorkflowTracker> = new Map();
  private isInitialized: boolean = false;

  private constructor(config?: SentryManagerConfig) {
    this.configStorage = config?.storage 
      ? new SentryConfigStorage(config.storage)
      : new SentryConfigStorage();
    
    this.globalConfig = {
      enabled: true,
      defaultLogLevel: SentryLogLevel.INFO,
      enableWorkflowTracking: true,
      enablePerformanceTracking: true,
      enableConsoleOverride: false,
      ...config?.globalConfig
    };

    if (config?.localStorageConfig) {
      this.setLocalStorageConfig(config.localStorageConfig);
    }
  }

  static getInstance(config?: SentryManagerConfig): SentryManager {
    if (!SentryManager.instance) {
      SentryManager.instance = new SentryManager(config);
    }
    return SentryManager.instance;
  }

  initialize(config?: SentryManagerConfig): void {
    if (this.isInitialized) {
      console.warn('[SentryManager] Already initialized');
      return;
    }

    if (config?.globalConfig) {
      this.globalConfig = { ...this.globalConfig, ...config.globalConfig };
    }

    if (config?.localStorageConfig) {
      this.setLocalStorageConfig(config.localStorageConfig);
    }

    this.isInitialized = true;
    console.log('[SentryManager] Initialized successfully', this.globalConfig);
  }

  private getLogger(componentName: string): ILogger {
    if (!this.componentLoggers.has(componentName)) {
      const config = this.configStorage.getComponentConfig(componentName);
      const logLevel = config?.logLevel || 
                      this.configStorage.getComponentLogLevel(componentName) as SentryLogLevel || 
                      this.globalConfig.defaultLogLevel || 
                      SentryLogLevel.INFO;
      
      const logger = new SentryLogger(componentName, logLevel);
      this.componentLoggers.set(componentName, logger);
    }
    
    return this.componentLoggers.get(componentName)!;
  }

  private getWorkflowTracker(componentName: string): IWorkflowTracker {
    if (!this.workflowTrackers.has(componentName)) {
      const tracker = new WorkflowTracker(componentName);
      this.workflowTrackers.set(componentName, tracker);
    }
    
    return this.workflowTrackers.get(componentName)!;
  }

  // Configuration methods
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
    
    if (config.componentConfigs) {
      Object.entries(config.componentConfigs).forEach(([name, config]) => {
        this.configStorage.setComponentConfig(name, config);
      });
    }
  }

  clearLocalStorageConfig(): void {
    this.configStorage.clear();
  }

  // Logging methods
  logTrace(componentName: string, message: string, context?: Record<string, any>): void {
    if (!this.isEnabled()) return;
    this.getLogger(componentName).logTrace(message, context);
  }

  logDebug(componentName: string, message: string, context?: Record<string, any>): void {
    if (!this.isEnabled()) return;
    this.getLogger(componentName).logDebug(message, context);
  }

  logInfo(componentName: string, message: string, context?: Record<string, any>): void {
    if (!this.isEnabled()) return;
    this.getLogger(componentName).logInfo(message, context);
  }

  logWarning(componentName: string, message: string, context?: Record<string, any>): void {
    if (!this.isEnabled()) return;
    this.getLogger(componentName).logWarning(message, context);
  }

  logError(componentName: string, error: Error | string, context?: Record<string, any>): void {
    if (!this.isEnabled()) return;
    this.getLogger(componentName).logError(error, context);
  }

  logFatal(componentName: string, error: Error | string, context?: Record<string, any>): void {
    if (!this.isEnabled()) return;
    this.getLogger(componentName).logFatal(error, context);
  }

  // Workflow methods
  startWorkflow(workflowId: string, workflowName: string, componentName: string, metadata?: Record<string, any>): void {
    if (!this.isWorkflowTrackingEnabled()) return;
    this.getWorkflowTracker(componentName).startWorkflow(workflowId, workflowName, metadata);
  }

  updateWorkflow(workflowId: string, state: WorkflowState, componentName: string, metadata?: Record<string, any>): void {
    if (!this.isWorkflowTrackingEnabled()) return;
    this.getWorkflowTracker(componentName).updateWorkflow(workflowId, state, metadata);
  }

  completeWorkflow(workflowId: string, componentName: string, success?: boolean, metadata?: Record<string, any>): void {
    if (!this.isWorkflowTrackingEnabled()) return;
    this.getWorkflowTracker(componentName).completeWorkflow(workflowId, success, metadata);
  }

  async trackPerformance<T>(componentName: string, operationName: string, operation: () => Promise<T> | T): Promise<T> {
    if (!this.isPerformanceTrackingEnabled()) {
      return operation();
    }
    return this.getWorkflowTracker(componentName).trackPerformance(operationName, operation);
  }

  // Utility methods
  isEnabled(): boolean {
    return this.globalConfig.enabled !== false && this.configStorage.isEnabled();
  }

  isWorkflowTrackingEnabled(): boolean {
    return this.isEnabled() && this.globalConfig.enableWorkflowTracking !== false;
  }

  isPerformanceTrackingEnabled(): boolean {
    return this.isEnabled() && this.globalConfig.enablePerformanceTracking !== false;
  }

  configureComponent(componentName: string, config: ComponentConfig): void {
    this.configStorage.setComponentConfig(componentName, config);
    
    // Update existing logger if it exists
    if (this.componentLoggers.has(componentName)) {
      const logger = this.componentLoggers.get(componentName) as SentryLogger;
      if (config.logLevel) {
        logger.setLogLevel(config.logLevel);
      }
      if (config.enabled !== undefined) {
        logger.setEnabled(config.enabled);
      }
    }
  }

  getComponentConfig(componentName: string): ComponentConfig | null {
    return this.configStorage.getComponentConfig(componentName);
  }

  getAllComponentNames(): string[] {
    return this.configStorage.getAllComponentNames();
  }

  // Error capture for Sentry
  captureError(error: Error | string, context?: Record<string, any>): void {
    if (!this.isEnabled()) return;
    
    // Send to real Sentry SDK
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const sentry = (window as any).Sentry;
      try {
        if (error instanceof Error) {
          sentry.captureException(error, { 
            extra: context,
            tags: { source: 'sg-sentry-manager' }
          });
        } else {
          sentry.captureMessage(error, { 
            level: 'error', 
            extra: context,
            tags: { source: 'sg-sentry-manager' }
          });
        }
        console.log('[SentryManager] Error sent to Sentry successfully');
      } catch (sentryError) {
        console.error('[SentryManager] Failed to send to Sentry:', sentryError);
      }
    } else {
      console.warn('[SentryManager] Sentry SDK not available');
    }
    
    console.error('[SentryManager] Error captured:', error, context);
  }

  // Cleanup
  destroy(): void {
    this.componentLoggers.clear();
    this.workflowTrackers.clear();
    this.isInitialized = false;
    SentryManager.instance = null as any;
  }
} 