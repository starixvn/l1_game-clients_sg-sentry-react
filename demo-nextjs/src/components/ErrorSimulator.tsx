'use client';

import { useState } from 'react';
import {
    logTrace,
    logDebug,
    logInfo,
    logWarning,
    logError,
    logFatal,
    captureError,
    startWorkflow,
    completeWorkflow,
    trackPerformance
} from 'sg-sentry';
import { getComponentConfig } from '@/configs/app-settings';

export function ErrorSimulator() {
    const componentName = 'ErrorSimulator';
    const componentConfig = getComponentConfig(componentName);

    // Safe fallback values
    const logLevel = componentConfig?.logLevel || 'debug';
    const enableWorkflowTracking = componentConfig?.enableWorkflowTracking || false;
    const enablePerformanceTracking = componentConfig?.enablePerformanceTracking || false;

    const [isSimulating, setIsSimulating] = useState(false);
    const [lastError, setLastError] = useState<string>('');

    const simulateError = async (errorType: string) => {
        if (enableWorkflowTracking) {
            const workflowId = `error-simulation-${Date.now()}`;
            startWorkflow(workflowId, `Simulate ${errorType} Error`, componentName, {
                errorType,
                timestamp: Date.now()
            });
        }

        setIsSimulating(true);
        setLastError('');

        try {
            if (enablePerformanceTracking) {
                await trackPerformance(componentName, `simulate-${errorType}-error`, async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                });
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            switch (errorType) {
                case 'javascript':
                    throw new Error('Simulated JavaScript Error: Something went wrong in the application');

                case 'network':
                    throw new Error('Simulated Network Error: Failed to fetch data from server');

                case 'validation':
                    throw new Error('Simulated Validation Error: Invalid input data provided');

                case 'timeout':
                    throw new Error('Simulated Timeout Error: Request timed out after 30 seconds');

                case 'memory':
                    throw new Error('Simulated Memory Error: Out of memory allocation');

                case 'syntax':
                    throw new SyntaxError('Simulated Syntax Error: Unexpected token in code');

                case 'type':
                    throw new TypeError('Simulated Type Error: Cannot read property of undefined');

                case 'reference':
                    throw new ReferenceError('Simulated Reference Error: Variable is not defined');

                default:
                    throw new Error('Unknown error type');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setLastError(errorMessage);

            // Log the error based on component configuration
            switch (logLevel) {
                case 'trace':
                    logTrace(componentName, `Simulated ${errorType} error`, { errorType, error: errorMessage });
                    break;
                case 'debug':
                    logDebug(componentName, `Simulated ${errorType} error`, { errorType, error: errorMessage });
                    break;
                case 'info':
                    logInfo(componentName, `Simulated ${errorType} error`, { errorType, error: errorMessage });
                    break;
                case 'warning':
                    logWarning(componentName, `Simulated ${errorType} error`, { errorType, error: errorMessage });
                    break;
                case 'error':
                    logError(componentName, error as Error, { errorType, timestamp: Date.now() });
                    break;
                case 'fatal':
                    logFatal(componentName, error as Error, { errorType, timestamp: Date.now() });
                    break;
                default:
                    logError(componentName, error as Error, { errorType, timestamp: Date.now() });
            }

            // Capture error in Sentry
            captureError(error as Error, {
                tags: { errorType, component: componentName },
                extra: { simulation: true, timestamp: Date.now() }
            });

            if (enableWorkflowTracking) {
                const workflowId = `error-simulation-${Date.now()}`;
                completeWorkflow(workflowId, componentName, false, {
                    errorType,
                    error: errorMessage,
                    timestamp: Date.now()
                });
            }
        } finally {
            setIsSimulating(false);
        }
    };

    const errorTypes = [
        { id: 'javascript', label: 'JavaScript Error', description: 'General JavaScript runtime error', icon: '💥' },
        { id: 'network', label: 'Network Error', description: 'API request failure', icon: '🌐' },
        { id: 'validation', label: 'Validation Error', description: 'Input validation failure', icon: '✅' },
        { id: 'timeout', label: 'Timeout Error', description: 'Request timeout', icon: '⏰' },
        { id: 'memory', label: 'Memory Error', description: 'Out of memory', icon: '🧠' },
        { id: 'syntax', label: 'Syntax Error', description: 'Code syntax error', icon: '📝' },
        { id: 'type', label: 'Type Error', description: 'Type mismatch error', icon: '🔤' },
        { id: 'reference', label: 'Reference Error', description: 'Undefined variable', icon: '🔗' },
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Simulator</h2>
                <p className="text-gray-600">
                    Simulate various types of errors to test SG-Sentry logging and error tracking capabilities.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Log Level: <span className="font-medium">{logLevel}</span></span>
                    <span>Workflow: <span className="font-medium">{enableWorkflowTracking ? 'Enabled' : 'Disabled'}</span></span>
                    <span>Performance: <span className="font-medium">{enablePerformanceTracking ? 'Enabled' : 'Disabled'}</span></span>
                </div>
            </div>

            {/* Error Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {errorTypes.map((errorType) => (
                    <button
                        key={errorType.id}
                        onClick={() => simulateError(errorType.id)}
                        disabled={isSimulating}
                        className="group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{errorType.icon}</span>
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                                    {errorType.label}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {errorType.description}
                                </p>
                            </div>
                        </div>
                        {isSimulating && (
                            <div className="absolute inset-0 bg-red-50 bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Last Error Display */}
            {lastError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <span className="text-red-500 text-lg">🚨</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-red-800">Last Simulated Error</h3>
                            <p className="mt-1 text-sm text-red-700">{lastError}</p>
                            <p className="mt-2 text-xs text-red-600">
                                This error has been logged to Sentry with component configuration: {componentName}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Component Configuration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Component Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-blue-600 font-medium">Component:</span>
                        <span className="ml-2 text-blue-800">{componentName}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Log Level:</span>
                        <span className="ml-2 text-blue-800">{logLevel}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Workflow Tracking:</span>
                        <span className="ml-2 text-blue-800">{enableWorkflowTracking ? '✅' : '❌'}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Performance Tracking:</span>
                        <span className="ml-2 text-blue-800">{enablePerformanceTracking ? '✅' : '❌'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 