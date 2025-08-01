'use client';

import { useState, useEffect } from 'react';
import {
    logInfo,
    logWarning,
    logError,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance
} from 'sg-sentry';
import { getComponentConfig } from '@/configs/app-settings';

interface WorkflowStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: number;
    endTime?: number;
    duration?: number;
    metadata?: any;
}

interface Workflow {
    id: string;
    name: string;
    component: string;
    status: 'running' | 'completed' | 'failed';
    startTime: number;
    endTime?: number;
    duration?: number;
    steps: WorkflowStep[];
    metadata?: any;
}

export function WorkflowTracker() {
    const componentName = 'WorkflowTracker';
    const componentConfig = getComponentConfig(componentName);

    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const predefinedWorkflows = [
        {
            name: 'User Registration',
            steps: [
                { name: 'Validate Input', duration: 1000 },
                { name: 'Check Email Availability', duration: 1500 },
                { name: 'Create User Account', duration: 2000 },
                { name: 'Send Welcome Email', duration: 1000 },
                { name: 'Setup User Profile', duration: 1500 }
            ]
        },
        {
            name: 'Payment Processing',
            steps: [
                { name: 'Validate Payment Method', duration: 800 },
                { name: 'Process Payment', duration: 3000 },
                { name: 'Update Account Balance', duration: 1200 },
                { name: 'Generate Receipt', duration: 600 },
                { name: 'Send Confirmation', duration: 1000 }
            ]
        },
        {
            name: 'Game Session',
            steps: [
                { name: 'Initialize Game', duration: 500 },
                { name: 'Load User Data', duration: 1000 },
                { name: 'Setup Game Board', duration: 800 },
                { name: 'Start Game Loop', duration: 2000 },
                { name: 'Save Game State', duration: 1200 }
            ]
        },
        {
            name: 'Data Export',
            steps: [
                { name: 'Query Database', duration: 2000 },
                { name: 'Process Data', duration: 3000 },
                { name: 'Generate Report', duration: 1500 },
                { name: 'Compress Files', duration: 1000 },
                { name: 'Upload to Cloud', duration: 2500 }
            ]
        }
    ];

    const startWorkflowDemo = async (workflowTemplate: any) => {
        if (isRunning) return;

        const workflowId = `workflow-${Date.now()}`;
        const workflow: Workflow = {
            id: workflowId,
            name: workflowTemplate.name,
            component: componentName,
            status: 'running',
            startTime: Date.now(),
            steps: workflowTemplate.steps.map((step: any, index: number) => ({
                id: `step-${index}`,
                name: step.name,
                status: 'pending' as const,
                duration: step.duration
            }))
        };

        setCurrentWorkflow(workflow);
        setWorkflows(prev => [workflow, ...prev]);
        setIsRunning(true);

        if (componentConfig.enableWorkflowTracking) {
            startWorkflow(workflowId, workflowTemplate.name, componentName, {
                stepCount: workflowTemplate.steps.length,
                timestamp: Date.now()
            });
        }

        logInfo(componentName, 'Workflow started', {
            workflowId,
            workflowName: workflowTemplate.name,
            stepCount: workflowTemplate.steps.length,
            timestamp: Date.now()
        });

        // Execute steps sequentially
        for (let i = 0; i < workflowTemplate.steps.length; i++) {
            const step = workflowTemplate.steps[i];

            // Update step to running
            setCurrentWorkflow(prev => {
                if (!prev) return prev;
                const updated = { ...prev };
                updated.steps[i] = { ...updated.steps[i], status: 'running', startTime: Date.now() };
                return updated;
            });

            if (componentConfig.enableWorkflowTracking) {
                updateWorkflow(workflowId, 'running', componentName, {
                    currentStep: i + 1,
                    totalSteps: workflowTemplate.steps.length,
                    stepName: step.name,
                    timestamp: Date.now()
                });
            }

            logInfo(componentName, `Step ${i + 1} started`, {
                workflowId,
                stepName: step.name,
                stepIndex: i + 1,
                timestamp: Date.now()
            });

            // Simulate step execution
            await new Promise(resolve => setTimeout(resolve, step.duration));

            // Update step to completed
            setCurrentWorkflow(prev => {
                if (!prev) return prev;
                const updated = { ...prev };
                const endTime = Date.now();
                updated.steps[i] = {
                    ...updated.steps[i],
                    status: 'completed',
                    endTime,
                    duration: endTime - (updated.steps[i].startTime || endTime)
                };
                return updated;
            });

            logInfo(componentName, `Step ${i + 1} completed`, {
                workflowId,
                stepName: step.name,
                stepIndex: i + 1,
                duration: step.duration,
                timestamp: Date.now()
            });
        }

        // Complete workflow
        const endTime = Date.now();
        const finalWorkflow = {
            ...workflow,
            status: 'completed' as const,
            endTime,
            duration: endTime - workflow.startTime
        };

        setCurrentWorkflow(finalWorkflow);
        setWorkflows(prev => prev.map(w => w.id === workflowId ? finalWorkflow : w));
        setIsRunning(false);

        if (componentConfig.enableWorkflowTracking) {
            completeWorkflow(workflowId, componentName, true, {
                totalDuration: finalWorkflow.duration,
                stepCount: workflowTemplate.steps.length,
                timestamp: Date.now()
            });
        }

        logInfo(componentName, 'Workflow completed', {
            workflowId,
            workflowName: workflowTemplate.name,
            totalDuration: finalWorkflow.duration,
            timestamp: Date.now()
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-gray-500';
            case 'running': return 'text-blue-600';
            case 'completed': return 'text-green-600';
            case 'failed': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'running': return '🔄';
            case 'completed': return '✅';
            case 'failed': return '❌';
            default: return '⏳';
        }
    };

    const formatDuration = (ms: number) => {
        return `${(ms / 1000).toFixed(1)}s`;
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Tracker</h2>
                <p className="text-gray-600">
                    Demonstrate SG-Sentry workflow tracking with predefined workflow templates.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Log Level: <span className="font-medium">{componentConfig.logLevel}</span></span>
                    <span>Workflow: <span className="font-medium">{componentConfig.enableWorkflowTracking ? 'Enabled' : 'Disabled'}</span></span>
                    <span>Performance: <span className="font-medium">{componentConfig.enablePerformanceTracking ? 'Enabled' : 'Disabled'}</span></span>
                </div>
            </div>

            {/* Workflow Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {predefinedWorkflows.map((workflow, index) => (
                    <button
                        key={index}
                        onClick={() => startWorkflowDemo(workflow)}
                        disabled={isRunning}
                        className="group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="text-center">
                            <div className="text-2xl mb-2">
                                {index === 0 ? '👤' : index === 1 ? '💳' : index === 2 ? '🎮' : '📊'}
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {workflow.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {workflow.steps.length} steps
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Total: {formatDuration(workflow.steps.reduce((sum, step) => sum + step.duration, 0))}
                            </p>
                        </div>
                        {isRunning && (
                            <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Current Workflow Progress */}
            {currentWorkflow && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {currentWorkflow.name} - {currentWorkflow.status}
                        </h3>
                        <div className="text-sm text-gray-500">
                            {currentWorkflow.duration ? formatDuration(currentWorkflow.duration) : 'Running...'}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>
                                {currentWorkflow.steps.filter(s => s.status === 'completed').length} / {currentWorkflow.steps.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(currentWorkflow.steps.filter(s => s.status === 'completed').length / currentWorkflow.steps.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2">
                        {currentWorkflow.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getStatusIcon(step.status)}</span>
                                    <div>
                                        <div className="font-medium text-gray-900">{step.name}</div>
                                        <div className="text-sm text-gray-500">
                                            Step {index + 1} of {currentWorkflow.steps.length}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-medium ${getStatusColor(step.status)}`}>
                                        {step.status}
                                    </div>
                                    {step.duration && (
                                        <div className="text-sm text-gray-500">
                                            {formatDuration(step.duration)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Workflow History */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow History</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {workflows.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No workflows executed yet. Start a workflow to see history.
                        </div>
                    ) : (
                        workflows.map((workflow) => (
                            <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getStatusIcon(workflow.status)}</span>
                                    <div>
                                        <div className="font-medium text-gray-900">{workflow.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(workflow.startTime).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-medium ${getStatusColor(workflow.status)}`}>
                                        {workflow.status}
                                    </div>
                                    {workflow.duration && (
                                        <div className="text-sm text-gray-500">
                                            {formatDuration(workflow.duration)}
                                        </div>
                                    )}
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