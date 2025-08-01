'use client';

import { useState, useEffect } from 'react';
import {
    logInfo,
    logWarning,
    logError,
    trackPerformance
} from 'sg-sentry';
import { getComponentConfig } from '@/configs/app-settings';

interface PerformanceMetric {
    id: string;
    name: string;
    duration: number;
    timestamp: number;
    component: string;
    operation: string;
    success: boolean;
}

export function PerformanceMonitor() {
    const componentName = 'PerformanceMonitor';
    const componentConfig = getComponentConfig(componentName);

    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentTest, setCurrentTest] = useState<string>('');

    const performanceTests = [
        {
            name: 'Data Processing',
            description: 'Simulate heavy data processing operations',
            icon: '📊',
            operations: [
                { name: 'Sort Large Array', duration: 2000 },
                { name: 'Filter Data', duration: 1500 },
                { name: 'Transform Objects', duration: 1800 },
                { name: 'Calculate Statistics', duration: 1200 }
            ]
        },
        {
            name: 'API Calls',
            description: 'Simulate network requests and API interactions',
            icon: '🌐',
            operations: [
                { name: 'Fetch User Data', duration: 800 },
                { name: 'Update Profile', duration: 1200 },
                { name: 'Upload File', duration: 2500 },
                { name: 'Sync Data', duration: 1800 }
            ]
        },
        {
            name: 'UI Operations',
            description: 'Simulate complex UI rendering and interactions',
            icon: '🎨',
            operations: [
                { name: 'Render Complex Component', duration: 500 },
                { name: 'Update DOM Elements', duration: 300 },
                { name: 'Handle User Input', duration: 200 },
                { name: 'Animate Elements', duration: 1000 }
            ]
        },
        {
            name: 'File Operations',
            description: 'Simulate file reading, writing, and processing',
            icon: '📁',
            operations: [
                { name: 'Read Large File', duration: 1500 },
                { name: 'Parse JSON Data', duration: 800 },
                { name: 'Compress Data', duration: 2000 },
                { name: 'Write to Storage', duration: 1200 }
            ]
        }
    ];

    const runPerformanceTest = async (test: any) => {
        if (isRunning) return;

        setIsRunning(true);
        setCurrentTest(test.name);

        logInfo(componentName, 'Performance test started', {
            testName: test.name,
            operationCount: test.operations.length,
            timestamp: Date.now()
        });

        for (let i = 0; i < test.operations.length; i++) {
            const operation = test.operations[i];

            setCurrentTest(`${test.name} - ${operation.name}`);

            if (componentConfig.enablePerformanceTracking) {
                await trackPerformance(componentName, operation.name, async () => {
                    await new Promise(resolve => setTimeout(resolve, operation.duration));
                });
            } else {
                await new Promise(resolve => setTimeout(resolve, operation.duration));
            }

            const metric: PerformanceMetric = {
                id: `metric-${Date.now()}-${i}`,
                name: operation.name,
                duration: operation.duration,
                timestamp: Date.now(),
                component: componentName,
                operation: operation.name,
                success: true
            };

            setMetrics(prev => [metric, ...prev]);

            logInfo(componentName, 'Operation completed', {
                operationName: operation.name,
                duration: operation.duration,
                timestamp: Date.now()
            });
        }

        setIsRunning(false);
        setCurrentTest('');

        logInfo(componentName, 'Performance test completed', {
            testName: test.name,
            totalOperations: test.operations.length,
            timestamp: Date.now()
        });
    };

    const runBatchTest = async () => {
        if (isRunning) return;

        setIsRunning(true);
        setCurrentTest('Batch Performance Test');

        logInfo(componentName, 'Batch performance test started', {
            testCount: performanceTests.length,
            timestamp: Date.now()
        });

        for (const test of performanceTests) {
            for (const operation of test.operations) {
                setCurrentTest(`${test.name} - ${operation.name}`);

                if (componentConfig.enablePerformanceTracking) {
                    await trackPerformance(componentName, `${test.name}-${operation.name}`, async () => {
                        await new Promise(resolve => setTimeout(resolve, operation.duration));
                    });
                } else {
                    await new Promise(resolve => setTimeout(resolve, operation.duration));
                }

                const metric: PerformanceMetric = {
                    id: `batch-${Date.now()}-${Math.random()}`,
                    name: `${test.name} - ${operation.name}`,
                    duration: operation.duration,
                    timestamp: Date.now(),
                    component: componentName,
                    operation: operation.name,
                    success: true
                };

                setMetrics(prev => [metric, ...prev]);
            }
        }

        setIsRunning(false);
        setCurrentTest('');

        logInfo(componentName, 'Batch performance test completed', {
            totalOperations: performanceTests.reduce((sum, test) => sum + test.operations.length, 0),
            timestamp: Date.now()
        });
    };

    const clearMetrics = () => {
        setMetrics([]);
        logInfo(componentName, 'Performance metrics cleared', {
            timestamp: Date.now()
        });
    };

    const getAverageDuration = () => {
        if (metrics.length === 0) return 0;
        const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
        return total / metrics.length;
    };

    const getSlowestOperation = () => {
        if (metrics.length === 0) return null;
        return metrics.reduce((slowest, current) =>
            current.duration > slowest.duration ? current : slowest
        );
    };

    const formatDuration = (ms: number) => {
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const getDurationColor = (duration: number) => {
        if (duration < 1000) return 'text-green-600';
        if (duration < 2000) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Monitor</h2>
                <p className="text-gray-600">
                    Monitor and track performance metrics using SG-Sentry performance tracking capabilities.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Log Level: <span className="font-medium">{componentConfig.logLevel}</span></span>
                    <span>Workflow: <span className="font-medium">{componentConfig.enableWorkflowTracking ? 'Enabled' : 'Disabled'}</span></span>
                    <span>Performance: <span className="font-medium">{componentConfig.enablePerformanceTracking ? 'Enabled' : 'Disabled'}</span></span>
                </div>
            </div>

            {/* Performance Test Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceTests.map((test, index) => (
                    <button
                        key={index}
                        onClick={() => runPerformanceTest(test)}
                        disabled={isRunning}
                        className="group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-3">{test.icon}</div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {test.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {test.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                {test.operations.length} operations
                            </p>
                        </div>
                        {isRunning && currentTest.startsWith(test.name) && (
                            <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Batch Test Button */}
            <div className="flex justify-center">
                <button
                    onClick={runBatchTest}
                    disabled={isRunning}
                    className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Running Batch Test...</span>
                        </div>
                    ) : (
                        'Run All Performance Tests'
                    )}
                </button>
            </div>

            {/* Current Test Status */}
            {isRunning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <div>
                            <h3 className="font-medium text-blue-800">Currently Running</h3>
                            <p className="text-sm text-blue-600">{currentTest}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Statistics */}
            {metrics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Total Operations</h3>
                        <div className="text-3xl font-bold text-blue-600">{metrics.length}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Average Duration</h3>
                        <div className="text-3xl font-bold text-green-600">{formatDuration(getAverageDuration())}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Slowest Operation</h3>
                        <div className="text-3xl font-bold text-red-600">
                            {getSlowestOperation() ? formatDuration(getSlowestOperation()!.duration) : 'N/A'}
                        </div>
                        {getSlowestOperation() && (
                            <div className="text-sm text-gray-500 mt-1">{getSlowestOperation()!.name}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Performance Metrics Table */}
            {metrics.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
                            <button
                                onClick={clearMetrics}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Operation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {metrics.map((metric) => (
                                    <tr key={metric.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {metric.name}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getDurationColor(metric.duration)}`}>
                                            {formatDuration(metric.duration)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(metric.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${metric.success
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {metric.success ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                        <span className="ml-2 text-blue-800">{componentConfig.logLevel}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Workflow Tracking:</span>
                        <span className="ml-2 text-blue-800">{componentConfig.enableWorkflowTracking ? '✅' : '❌'}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Performance Tracking:</span>
                        <span className="ml-2 text-blue-800">{componentConfig.enablePerformanceTracking ? '✅' : '❌'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 