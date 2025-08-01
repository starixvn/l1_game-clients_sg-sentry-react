'use client';

import { useState } from 'react';
import { DemoLayout } from '@/components/DemoLayout';
import { ErrorSimulator } from '@/components/ErrorSimulator';
import { LogViewer } from '@/components/LogViewer';
import { ConfigurationPanel } from '@/components/ConfigurationPanel';
import { GameBoard } from '@/components/GameBoard';
import { WorkflowTracker } from '@/components/WorkflowTracker';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { logInfo } from 'sg-sentry';

type TabType = 'error-simulator' | 'log-viewer' | 'configuration' | 'game-board' | 'workflow' | 'performance';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<TabType>('error-simulator');

    const componentName = 'SentryDemo';

    const handleTabChange = (tab: TabType) => {
        logInfo(componentName, 'Tab changed', {
            fromTab: activeTab,
            toTab: tab,
            timestamp: Date.now()
        });
        setActiveTab(tab);
    };

    const tabs = [
        { id: 'error-simulator' as TabType, label: 'Error Simulator', icon: '🚨' },
        { id: 'log-viewer' as TabType, label: 'Log Viewer', icon: '📋' },
        { id: 'configuration' as TabType, label: 'Configuration', icon: '⚙️' },
        { id: 'game-board' as TabType, label: 'Game Board', icon: '🎮' },
        { id: 'workflow' as TabType, label: 'Workflow Tracker', icon: '🔄' },
        { id: 'performance' as TabType, label: 'Performance', icon: '⚡' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'error-simulator':
                return <ErrorSimulator />;
            case 'log-viewer':
                return <LogViewer />;
            case 'configuration':
                return <ConfigurationPanel />;
            case 'game-board':
                return <GameBoard />;
            case 'workflow':
                return <WorkflowTracker />;
            case 'performance':
                return <PerformanceMonitor />;
            default:
                return <ErrorSimulator />;
        }
    };

    return (
        <DemoLayout
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
        >
            {renderTabContent()}
        </DemoLayout>
    );
} 