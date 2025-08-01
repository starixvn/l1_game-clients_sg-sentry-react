'use client';

import { useState, useEffect } from 'react';
import { configureComponent, getComponentConfig, getAllComponentNames } from 'sg-sentry';
import { getComponentConfig as getAppComponentConfig, getAllComponentNames as getAppAllComponentNames, getSystemConfig, getSimulatorConfig } from '@/configs/app-settings';

export function ConfigurationPanel() {
    const componentName = 'ConfigurationPanel';
    const componentConfig = getAppComponentConfig(componentName);

    // Safe fallback values
    const logLevel = componentConfig?.logLevel || 'debug';
    const enableWorkflowTracking = componentConfig?.enableWorkflowTracking || false;
    const enablePerformanceTracking = componentConfig?.enablePerformanceTracking || false;

    const [selectedComponent, setSelectedComponent] = useState<string>('');
    const [componentConfigs, setComponentConfigs] = useState<Record<string, any>>({});
    const [systemConfig, setSystemConfig] = useState<any>({});
    const [simulatorConfig, setSimulatorConfig] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConfigurations = async () => {
            try {
                // Load all component names and configurations
                const allComponentNames = getAppAllComponentNames();
                const configs: Record<string, any> = {};
                
                allComponentNames.forEach(name => {
                    configs[name] = getAppComponentConfig(name);
                });

                setComponentConfigs(configs);
                setSystemConfig(getSystemConfig());
                setSimulatorConfig(getSimulatorConfig());
                
                if (allComponentNames.length > 0) {
                    setSelectedComponent(allComponentNames[0]);
                }
            } catch (error) {
                console.error('Failed to load configurations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConfigurations();
    }, []);

    const handleConfigUpdate = (componentName: string, field: string, value: any) => {
        try {
            configureComponent(componentName, { [field]: value });
            
            // Update local state
            setComponentConfigs(prev => ({
                ...prev,
                [componentName]: {
                    ...prev[componentName],
                    [field]: value
                }
            }));

            console.log(`[ConfigurationPanel] Updated ${componentName}.${field} to ${value}`);
        } catch (error) {
            console.error(`Failed to update configuration for ${componentName}:`, error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading configurations...</span>
            </div>
        );
    }

    const selectedConfig = componentConfigs[selectedComponent];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Panel</h2>
                <p className="text-gray-600">
                    View and modify Sentry configuration for individual components, system settings, and simulator configurations.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Log Level: <span className="font-medium">{logLevel}</span></span>
                    <span>Workflow: <span className="font-medium">{enableWorkflowTracking ? 'Enabled' : 'Disabled'}</span></span>
                    <span>Performance: <span className="font-medium">{enablePerformanceTracking ? 'Enabled' : 'Disabled'}</span></span>
                </div>
            </div>

            {/* Component Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Component Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Component
                        </label>
                        <select
                            value={selectedComponent}
                            onChange={(e) => setSelectedComponent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.keys(componentConfigs).map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Component Configuration */}
                {selectedConfig && (
                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Log Level
                                </label>
                                <select
                                    value={selectedConfig.logLevel || 'debug'}
                                    onChange={(e) => handleConfigUpdate(selectedComponent, 'logLevel', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="trace">Trace</option>
                                    <option value="debug">Debug</option>
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="fatal">Fatal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Workflow Tracking
                                </label>
                                <select
                                    value={selectedConfig.enableWorkflowTracking ? 'true' : 'false'}
                                    onChange={(e) => handleConfigUpdate(selectedComponent, 'enableWorkflowTracking', e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Performance Tracking
                                </label>
                                <select
                                    value={selectedConfig.enablePerformanceTracking ? 'true' : 'false'}
                                    onChange={(e) => handleConfigUpdate(selectedComponent, 'enablePerformanceTracking', e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* System Configuration */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">System Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(systemConfig).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {key}
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Simulator Configuration */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Simulator Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(simulatorConfig).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {key}
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono">
                                {String(value)}
                            </div>
                        </div>
                    ))}
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