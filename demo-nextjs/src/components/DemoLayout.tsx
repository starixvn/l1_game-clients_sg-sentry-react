'use client';

import { ReactNode } from 'react';
import { logInfo } from 'sg-sentry';
import { getComponentConfig } from '@/configs/app-settings';

interface Tab {
    id: string;
    label: string;
    icon: string;
}

interface DemoLayoutProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    children: ReactNode;
}

export function DemoLayout({ tabs, activeTab, onTabChange, children }: DemoLayoutProps) {
    const componentName = 'DemoLayout';
    const componentConfig = getComponentConfig(componentName);

    const handleTabClick = (tabId: string) => {
        if (componentConfig?.enableWorkflowTracking) {
            logInfo(componentName, 'Tab navigation workflow', {
                fromTab: activeTab,
                toTab: tabId,
                timestamp: Date.now()
            });
        }
        onTabChange(tabId);
    };

    // Safe fallback values
    const logLevel = componentConfig?.logLevel || 'debug';
    const enableWorkflowTracking = componentConfig?.enableWorkflowTracking || false;
    const enablePerformanceTracking = componentConfig?.enablePerformanceTracking || false;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold">🚀</div>
                            <div>
                                <h1 className="text-xl font-semibold">SG-Sentry Demo</h1>
                                <p className="text-blue-100 text-sm">Next.js TypeScript with Component Configuration</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-500 px-3 py-1 rounded-full text-xs font-medium">
                                {logLevel.toUpperCase()}
                            </div>
                            <div className="text-blue-100 text-sm">
                                {enableWorkflowTracking ? '🔄' : '⏸️'} Workflow
                            </div>
                            <div className="text-blue-100 text-sm">
                                {enablePerformanceTracking ? '⚡' : '⏸️'} Performance
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                            SG-Sentry Demo • Built with Next.js & TypeScript
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <span>Component: {componentName}</span>
                            <span>Log Level: {logLevel}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
} 