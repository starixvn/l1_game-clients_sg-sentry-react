// SG-Sentry Demo - Browser Compatible Version
// This file demonstrates the core functionality in a browser environment

(function() {
    'use strict';

    // Initialize Sentry SDK for demo if not already initialized
    if (typeof window !== 'undefined' && window.Sentry && !window.Sentry.getCurrentHub().getClient()) {
        window.Sentry.init({
            dsn: 'https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056',
            environment: 'demo',
            release: '1.0.0',
            debug: true,
            tracesSampleRate: 1.0,
            replaysSessionSampleRate: 1.0,
            replaysOnErrorSampleRate: 1.0
        });
        console.log('[Sentry] SDK initialized successfully');
    }

    // Simple implementation of the core classes for demo
    class SentryLogger {
        constructor(componentName, logLevel = 'info') {
            this.componentName = componentName;
            this.logLevel = logLevel;
            this.isEnabled = true;
        }

        formatMessage(level, message, context) {
            const timestamp = new Date().toISOString();
            const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
            return `[${timestamp}] [${level.toUpperCase()}] [${this.componentName}] ${message}${contextStr}`;
        }

        logTrace(message, context) {
            if (this.isEnabled) {
                console.trace(this.formatMessage('trace', message, context));
            }
        }

        logDebug(message, context) {
            if (this.isEnabled) {
                console.debug(this.formatMessage('debug', message, context));
            }
        }

        logInfo(message, context) {
            if (this.isEnabled) {
                console.info(this.formatMessage('info', message, context));
            }
        }

        logWarning(message, context) {
            if (this.isEnabled) {
                console.warn(this.formatMessage('warning', message, context));
            }
        }

        logError(error, context) {
            if (this.isEnabled) {
                const message = error instanceof Error ? error.message : error;
                console.error(this.formatMessage('error', message, context));
                if (error instanceof Error) {
                    console.error(error.stack);
                }
            }
        }

        logFatal(error, context) {
            if (this.isEnabled) {
                const message = error instanceof Error ? error.message : error;
                console.error(this.formatMessage('fatal', message, context));
                if (error instanceof Error) {
                    console.error(error.stack);
                }
            }
        }
    }

    class WorkflowTracker {
        constructor(componentName) {
            this.componentName = componentName;
            this.workflows = new Map();
        }

        startWorkflow(workflowId, workflowName, metadata) {
            const workflow = {
                workflowId,
                workflowName,
                componentName: this.componentName,
                startTime: Date.now(),
                state: 'started',
                metadata
            };

            this.workflows.set(workflowId, workflow);
            console.log(`[Workflow] Started: ${workflowName} (${workflowId})`, { 
                component: this.componentName, 
                metadata 
            });
        }

        updateWorkflow(workflowId, state, metadata) {
            const workflow = this.workflows.get(workflowId);
            if (!workflow) {
                console.warn(`[Workflow] Workflow not found: ${workflowId}`);
                return;
            }

            workflow.state = state;
            if (metadata) {
                workflow.metadata = { ...workflow.metadata, ...metadata };
            }

            console.log(`[Workflow] Updated: ${workflow.workflowName} (${workflowId}) - ${state}`, { 
                component: this.componentName, 
                metadata: workflow.metadata 
            });
        }

        completeWorkflow(workflowId, success = true, metadata) {
            const workflow = this.workflows.get(workflowId);
            if (!workflow) {
                console.warn(`[Workflow] Workflow not found: ${workflowId}`);
                return;
            }

            workflow.endTime = Date.now();
            workflow.duration = workflow.endTime - workflow.startTime;
            workflow.success = success;
            workflow.state = success ? 'completed' : 'failed';
            
            if (metadata) {
                workflow.metadata = { ...workflow.metadata, ...metadata };
            }

            console.log(`[Workflow] Completed: ${workflow.workflowName} (${workflowId}) - ${success ? 'SUCCESS' : 'FAILED'}`, {
                component: this.componentName,
                duration: workflow.duration,
                metadata: workflow.metadata
            });

            this.workflows.delete(workflowId);
        }

        async trackPerformance(operationName, operation) {
            const startTime = Date.now();
            const workflowId = `${this.componentName}-${operationName}-${Date.now()}`;
            
            this.startWorkflow(workflowId, operationName, { operation: operationName });
            
            try {
                const result = await operation();
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                this.completeWorkflow(workflowId, true, { 
                    metrics: {
                        operationName,
                        componentName: this.componentName,
                        startTime,
                        endTime,
                        duration,
                        success: true
                    }
                });
                
                if (duration > 1000) {
                    console.warn(`[Performance] Slow operation detected: ${operationName} took ${duration}ms`);
                }
                
                return result;
            } catch (error) {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                this.completeWorkflow(workflowId, false, { 
                    metrics: {
                        operationName,
                        componentName: this.componentName,
                        startTime,
                        endTime,
                        duration,
                        success: false,
                        error
                    },
                    error 
                });
                
                console.error(`[Performance] Operation failed: ${operationName}`, {
                    component: this.componentName,
                    duration,
                    error
                });
                
                throw error;
            }
        }
    }

    class SentryManager {
        constructor() {
            this.componentLoggers = new Map();
            this.workflowTrackers = new Map();
            this.isEnabled = true;
            this.defaultLogLevel = 'info';
            this.enableWorkflowTracking = true;
            this.enablePerformanceTracking = true;
        }

        getLogger(componentName) {
            if (!this.componentLoggers.has(componentName)) {
                const logger = new SentryLogger(componentName, this.defaultLogLevel);
                this.componentLoggers.set(componentName, logger);
            }
            return this.componentLoggers.get(componentName);
        }

        getWorkflowTracker(componentName) {
            if (!this.workflowTrackers.has(componentName)) {
                const tracker = new WorkflowTracker(componentName);
                this.workflowTrackers.set(componentName, tracker);
            }
            return this.workflowTrackers.get(componentName);
        }

        logTrace(componentName, message, context) {
            if (!this.isEnabled) return;
            this.getLogger(componentName).logTrace(message, context);
        }

        logDebug(componentName, message, context) {
            if (!this.isEnabled) return;
            this.getLogger(componentName).logDebug(message, context);
        }

        logInfo(componentName, message, context) {
            if (!this.isEnabled) return;
            this.getLogger(componentName).logInfo(message, context);
        }

        logWarning(componentName, message, context) {
            if (!this.isEnabled) return;
            this.getLogger(componentName).logWarning(message, context);
        }

        logError(componentName, error, context) {
            if (!this.isEnabled) return;
            this.getLogger(componentName).logError(error, context);
        }

        logFatal(componentName, error, context) {
            if (!this.isEnabled) return;
            this.getLogger(componentName).logFatal(error, context);
        }

        startWorkflow(workflowId, workflowName, componentName, metadata) {
            if (!this.enableWorkflowTracking) return;
            this.getWorkflowTracker(componentName).startWorkflow(workflowId, workflowName, metadata);
        }

        updateWorkflow(workflowId, state, componentName, metadata) {
            if (!this.enableWorkflowTracking) return;
            this.getWorkflowTracker(componentName).updateWorkflow(workflowId, state, metadata);
        }

        completeWorkflow(workflowId, componentName, success, metadata) {
            if (!this.enableWorkflowTracking) return;
            this.getWorkflowTracker(componentName).completeWorkflow(workflowId, success, metadata);
        }

        async trackPerformance(componentName, operationName, operation) {
            if (!this.enablePerformanceTracking) {
                return operation();
            }
            return this.getWorkflowTracker(componentName).trackPerformance(operationName, operation);
        }

        captureError(error, context) {
            if (!this.isEnabled) return;
            
            if (window.Sentry) {
                if (error instanceof Error) {
                    window.Sentry.captureException(error, { extra: context });
                } else {
                    window.Sentry.captureMessage(error, { level: 'error', extra: context });
                }
            }
            
            console.error('[SentryManager] Error captured:', error, context);
        }
    }

    // Global manager instance
    const sentryManager = new SentryManager();

    // Global convenience functions
    window.SGSentry = {
        // Configuration
        configure: function(config) {
            if (config.enabled !== undefined) sentryManager.isEnabled = config.enabled;
            if (config.defaultLogLevel) sentryManager.defaultLogLevel = config.defaultLogLevel;
            if (config.enableWorkflowTracking !== undefined) sentryManager.enableWorkflowTracking = config.enableWorkflowTracking;
            if (config.enablePerformanceTracking !== undefined) sentryManager.enablePerformanceTracking = config.enablePerformanceTracking;
            console.log('[SGSentry] Configured:', config);
        },

        // Logging
        logTrace: (component, message, context) => sentryManager.logTrace(component, message, context),
        logDebug: (component, message, context) => sentryManager.logDebug(component, message, context),
        logInfo: (component, message, context) => sentryManager.logInfo(component, message, context),
        logWarning: (component, message, context) => sentryManager.logWarning(component, message, context),
        logError: (component, error, context) => sentryManager.logError(component, error, context),
        logFatal: (component, error, context) => sentryManager.logFatal(component, error, context),

        // Workflow
        startWorkflow: (id, name, component, metadata) => sentryManager.startWorkflow(id, name, component, metadata),
        updateWorkflow: (id, state, component, metadata) => sentryManager.updateWorkflow(id, state, component, metadata),
        completeWorkflow: (id, component, success, metadata) => sentryManager.completeWorkflow(id, component, success, metadata),

        // Performance
        trackPerformance: (component, operation, fn) => sentryManager.trackPerformance(component, operation, fn),

        // Error capture
        captureError: (error, context) => sentryManager.captureError(error, context),

        // Utility
        isEnabled: () => sentryManager.isEnabled,
        manager: sentryManager
    };

    console.log('🚀 SG-Sentry Demo loaded successfully!');
    console.log('📖 Use window.SGSentry to access the demo functions');
    console.log('🌐 Open the browser console to see detailed logs');

})(); 