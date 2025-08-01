'use client';

import { useState, useEffect } from 'react';
import {
    logInfo,
    logWarning,
    configureComponent,
    getComponentConfig,
    getAllComponentNames,
    isComponentLoggingEnabled,
    getSystemConfig,
    getSimulatorConfig,
    APP_ENV,
    VIVA88_SITE_ID,
    NOVA88_SITE_ID
} from 'sg-sentry';
import { getComponentConfig as getAppComponentConfig } from '@/configs/app-settings';

export function ConfigurationPanel() {
    const componentName = 'ConfigurationPanel';
    const componentConfig = getComponentConfig(componentName);

    const [selectedComponent, setSelectedComponent] = useState<string>('');
    const [componentConfigs, setComponentConfigs] = useState<Record<string, any>>({});
    const [systemConfig, setSystemConfig] = useState<any>({});
    const [simulatorConfig, setSimulatorConfig] = useState<any>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editConfig, setEditConfig] = useState<any>({});

    useEffect(() => {
        loadConfigurations();
    }, []);

    const loadConfigurations = () => {
        try {
            const allComponents = getAllComponentNames();
            const configs: Record<string, any> = {};

            allComponents.forEach(comp => {
                configs[comp] = getComponentConfig(comp);
            });

            setComponentConfigs(configs);
            setSystemConfig(getSystemConfig());
            setSimulatorConfig(getSimulatorConfig());

            if (allComponents.length > 0) {
                setSelectedComponent(allComponents[0]);
            }

            logInfo(componentName, 'Configurations loaded successfully', {
                componentCount: allComponents.length,
                timestamp: Date.now()
            });
        } catch (error) {
            logWarning(componentName, 'Failed to load some configurations', {
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now()
            });
        }
    };

    const handleComponentSelect = (component: string) => {
        setSelectedComponent(component);
        setEditConfig(componentConfigs[component] || {});
        setIsEditing(false);
    };

    const handleConfigUpdate = () => {
        try {
            configureComponent(selectedComponent, editConfig);

            setComponentConfigs(prev => ({
                ...prev,
                [selectedComponent]: editConfig
            }));

            logInfo(componentName, 'Component configuration updated', {
                component: selectedComponent,
                newConfig: editConfig,
                timestamp: Date.now()
            });

            setIsEditing(false);
        } catch (error) {
            logWarning(componentName, 'Failed to update component configuration', {
                component: selectedComponent,
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now()
            });
        }
    };

    const resetConfig = () => {
        const originalConfig = getAppComponentConfig(selectedComponent);
        setEditConfig(originalConfig);
    };

    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'trace': return 'text-gray-500';
            case 'debug': return 'text-blue-600';
            case 'info': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            case 'fatal': return 'text-red-800';
            default: return 'text-gray-600';
        }
    };

    const allComponents = getAllComponentNames();

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Panel</h2>
                <p className="text-gray-600">
                    View and modify component configurations, system settings, and simulator configurations.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Log Level: <span className="font-medium">{componentConfig.logLevel}</span></span>
                    <span>Workflow: <span className="font-medium">{componentConfig.enableWorkflowTracking ? 'Enabled' : 'Disabled'}</span></span>
                    <span>Performance: <span className="font-medium">{componentConfig.enablePerformanceTracking ? 'Enabled' : 'Disabled'}</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Component List */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Components</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {allComponents.map((component) => (
                                <button
                                    key={component}
                                    onClick={() => handleComponentSelect(component)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedComponent === component
                                            ? 'bg-blue-50 border border-blue-200 text-blue-700'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{component}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${getLogLevelColor(componentConfigs[component]?.logLevel || 'error')}`}>
                                            {componentConfigs[component]?.logLevel || 'error'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                        <span>{componentConfigs[component]?.enableWorkflowTracking ? '🔄' : '⏸️'}</span>
                                        <span>{componentConfigs[component]?.enablePerformanceTracking ? '⚡' : '⏸️'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Component Configuration */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedComponent ? `${selectedComponent} Configuration` : 'Select a Component'}
                            </h3>
                            {selectedComponent && (
                                <div className="flex space-x-2">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleConfigUpdate}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={resetConfig}
                                                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                                            >
                                                Reset
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedComponent && (
                            <div className="space-y-4">
                                {/* Log Level */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                                    {isEditing ? (
                                        <select
                                            value={editConfig.logLevel || 'error'}
                                            onChange={(e) => setEditConfig({ ...editConfig, logLevel: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="trace">Trace</option>
                                            <option value="debug">Debug</option>
                                            <option value="info">Info</option>
                                            <option value="warning">Warning</option>
                                            <option value="error">Error</option>
                                            <option value="fatal">Fatal</option>
                                        </select>
                                    ) : (
                                        <div className={`px-3 py-2 bg-gray-50 rounded-md ${getLogLevelColor(componentConfigs[selectedComponent]?.logLevel || 'error')}`}>
                                            {componentConfigs[selectedComponent]?.logLevel || 'error'}
                                        </div>
                                    )}
                                </div>

                                {/* Workflow Tracking */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Tracking</label>
                                    {isEditing ? (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editConfig.enableWorkflowTracking || false}
                                                onChange={(e) => setEditConfig({ ...editConfig, enableWorkflowTracking: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Enable workflow tracking</span>
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 rounded-md">
                                            {componentConfigs[selectedComponent]?.enableWorkflowTracking ? '✅ Enabled' : '❌ Disabled'}
                                        </div>
                                    )}
                                </div>

                                {/* Performance Tracking */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Performance Tracking</label>
                                    {isEditing ? (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editConfig.enablePerformanceTracking || false}
                                                onChange={(e) => setEditConfig({ ...editConfig, enablePerformanceTracking: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Enable performance tracking</span>
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 rounded-md">
                                            {componentConfigs[selectedComponent]?.enablePerformanceTracking ? '✅ Enabled' : '❌ Disabled'}
                                        </div>
                                    )}
                                </div>

                                {/* Raw Configuration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Raw Configuration</label>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-x-auto">
                                        {JSON.stringify(componentConfigs[selectedComponent], null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* System Configuration */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(systemConfig).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                                {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Simulator Configuration */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Simulator Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(simulatorConfig).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-mono">
                                {String(value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Environment Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Environment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-blue-600 font-medium">Current Environment:</span>
                        <span className="ml-2 text-blue-800">{APP_ENV.LOCAL}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Site ID:</span>
                        <span className="ml-2 text-blue-800">{VIVA88_SITE_ID}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Component Logging:</span>
                        <span className="ml-2 text-blue-800">{isComponentLoggingEnabled() ? '✅ Enabled' : '❌ Disabled'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 