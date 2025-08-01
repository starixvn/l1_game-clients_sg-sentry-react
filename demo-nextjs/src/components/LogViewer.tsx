'use client';

import { useState, useEffect } from 'react';
import { logTrace, logDebug, logInfo, logWarning, logError, logFatal } from 'sg-sentry';
import { getComponentConfig } from '@/configs/app-settings';

interface LogEntry {
    id: string;
    timestamp: Date;
    level: string;
    component: string;
    message: string;
    context?: any;
}

export function LogViewer() {
    const componentName = 'LogViewer';
    const componentConfig = getComponentConfig(componentName);

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [filterComponent, setFilterComponent] = useState<string>('all');
    const [autoScroll, setAutoScroll] = useState(true);

    // Generate sample logs
    const generateSampleLogs = () => {
        const sampleLogs: LogEntry[] = [];
        const levels = ['trace', 'debug', 'info', 'warning', 'error', 'fatal'];
        const components = ['ErrorSimulator', 'DemoLayout', 'LogViewer', 'ConfigurationPanel', 'GameBoard'];
        const messages = [
            'Component initialized successfully',
            'User interaction detected',
            'API request started',
            'Data validation completed',
            'Error occurred during operation',
            'Performance measurement recorded',
            'Workflow step completed',
            'Configuration loaded',
            'State updated',
            'Event handler triggered'
        ];

        for (let i = 0; i < 20; i++) {
            const level = levels[Math.floor(Math.random() * levels.length)];
            const component = components[Math.floor(Math.random() * components.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            const timestamp = new Date(Date.now() - Math.random() * 3600000); // Last hour

            sampleLogs.push({
                id: `log-${i}`,
                timestamp,
                level,
                component,
                message,
                context: {
                    userId: Math.floor(Math.random() * 1000),
                    sessionId: `session-${Math.floor(Math.random() * 10000)}`,
                    timestamp: timestamp.getTime()
                }
            });
        }

        return sampleLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    useEffect(() => {
        setLogs(generateSampleLogs());
    }, []);

    const addLog = (level: string, message: string, context?: any) => {
        const newLog: LogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            level,
            component: componentName,
            message,
            context
        };

        setLogs(prev => [newLog, ...prev]);
    };

    const handleLogTest = (level: string) => {
        const message = `Test ${level} log from LogViewer component`;
        const context = { test: true, timestamp: Date.now() };

        switch (level) {
            case 'trace':
                logTrace(componentName, message, context);
                break;
            case 'debug':
                logDebug(componentName, message, context);
                break;
            case 'info':
                logInfo(componentName, message, context);
                break;
            case 'warning':
                logWarning(componentName, message, context);
                break;
            case 'error':
                logError(componentName, new Error(message), context);
                break;
            case 'fatal':
                logFatal(componentName, new Error(message), context);
                break;
        }

        addLog(level, message, context);
    };

    const filteredLogs = logs.filter(log => {
        const levelMatch = filterLevel === 'all' || log.level === filterLevel;
        const componentMatch = filterComponent === 'all' || log.component === filterComponent;
        return levelMatch && componentMatch;
    });

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'trace': return 'text-gray-500';
            case 'debug': return 'text-blue-600';
            case 'info': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            case 'fatal': return 'text-red-800 font-bold';
            default: return 'text-gray-600';
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'trace': return '🔍';
            case 'debug': return '🐛';
            case 'info': return 'ℹ️';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'fatal': return '💀';
            default: return '📝';
        }
    };

    const uniqueComponents = Array.from(new Set(logs.map(log => log.component)));
    const uniqueLevels = Array.from(new Set(logs.map(log => log.level)));

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Log Viewer</h2>
                <p className="text-gray-600">
                    View and filter application logs. Test different log levels and see how they appear.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Log Level: <span className="font-medium">{componentConfig.logLevel}</span></span>
                    <span>Workflow: <span className="font-medium">{componentConfig.enableWorkflowTracking ? 'Enabled' : 'Disabled'}</span></span>
                    <span>Performance: <span className="font-medium">{componentConfig.enablePerformanceTracking ? 'Enabled' : 'Disabled'}</span></span>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filter by Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Level</label>
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Levels</option>
                        {uniqueLevels.map(level => (
                            <option key={level} value={level}>{level.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                {/* Filter by Component */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Component</label>
                    <select
                        value={filterComponent}
                        onChange={(e) => setFilterComponent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Components</option>
                        {uniqueComponents.map(component => (
                            <option key={component} value={component}>{component}</option>
                        ))}
                    </select>
                </div>

                {/* Auto Scroll Toggle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto Scroll</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">{autoScroll ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                {/* Clear Logs */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                    <button
                        onClick={() => setLogs([])}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Clear Logs
                    </button>
                </div>
            </div>

            {/* Test Log Buttons */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Test Log Generation</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {['trace', 'debug', 'info', 'warning', 'error', 'fatal'].map(level => (
                        <button
                            key={level}
                            onClick={() => handleLogTest(level)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${level === 'trace' || level === 'debug' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                    level === 'info' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                        level === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                            'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                        >
                            {getLevelIcon(level)} {level.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Display */}
            <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Log Output ({filteredLogs.length} entries)</h3>
                        <span className="text-xs text-gray-400">
                            {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>
                <div className="h-96 overflow-y-auto p-4 font-mono text-sm">
                    {filteredLogs.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                            No logs to display. Try changing filters or generating test logs.
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="mb-2 p-2 rounded bg-gray-800 border-l-4 border-gray-600">
                                <div className="flex items-start space-x-2">
                                    <span className="text-lg">{getLevelIcon(log.level)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                                            <span>{log.timestamp.toLocaleTimeString()}</span>
                                            <span className={`font-medium ${getLevelColor(log.level)}`}>
                                                {log.level.toUpperCase()}
                                            </span>
                                            <span className="text-blue-400">[{log.component}]</span>
                                        </div>
                                        <div className="text-gray-200">{log.message}</div>
                                        {log.context && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                Context: {JSON.stringify(log.context)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

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