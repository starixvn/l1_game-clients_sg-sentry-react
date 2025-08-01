import {
    configureSentry,
    logInfo,
    logError,
    logWarning,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    trackPerformance,
    useSentryHelper,
    SentryLogLevel
} from './dist/index';

// Example 1: Basic Configuration and Usage
console.log('=== Example 1: Basic Configuration and Usage ===');

// Initialize Sentry with configuration
configureSentry({
    enabled: true,
    defaultLogLevel: SentryLogLevel.INFO,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true
});

// Basic logging
logInfo('App', 'Application started successfully');
logWarning('App', 'This is a warning message');
logError('App', new Error('This is an error message'));

// Example 2: Workflow Tracking
console.log('\n=== Example 2: Workflow Tracking ===');

const workflowId = 'user-login-' + Date.now();
startWorkflow(workflowId, 'User Login', 'AuthComponent', { userId: '12345' });

// Simulate some work
setTimeout(() => {
    updateWorkflow(workflowId, 'in_progress', { step: 'validating_credentials' });

    setTimeout(() => {
        completeWorkflow(workflowId, true, { result: 'login_successful' });
    }, 1000);
}, 500);

// Example 3: Performance Tracking
console.log('\n=== Example 3: Performance Tracking ===');

async function simulateApiCall() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: 'API response' });
        }, 100);
    });
}

// Track performance of an async operation
trackPerformance('ApiComponent', 'fetch-user-data', simulateApiCall)
    .then(result => {
        console.log('API call completed:', result);
    })
    .catch(error => {
        console.error('API call failed:', error);
    });

// Example 4: Component-Specific Configuration
console.log('\n=== Example 4: Component-Specific Configuration ===');

import { configureComponent } from './dist/index';

// Configure specific component with different log level
configureComponent('DebugComponent', {
    logLevel: SentryLogLevel.DEBUG,
    enableWorkflowTracking: true,
    enablePerformanceTracking: false
});

logInfo('DebugComponent', 'This component has debug level logging enabled');

// Example 5: React Hook Usage (if in React environment)
console.log('\n=== Example 5: React Hook Usage ===');

// This would be used in a React component:
/*
import React from 'react';
import { useSentryHelper } from 'sg-sentry';

const MyComponent: React.FC = () => {
    const { logInfo, logError, startWorkflow, trackPerformance } = useSentryHelper({
        componentName: 'MyComponent',
        logLevel: SentryLogLevel.DEBUG,
        enableWorkflowTracking: true
    });

    const handleUserAction = async () => {
        const workflowId = 'user-action-' + Date.now();
        
        startWorkflow(workflowId, 'User Action', { action: 'button-click' });
        
        try {
            await trackPerformance('api-call', async () => {
                const result = await fetch('/api/data');
                return result.json();
            });
            
            logInfo('User action completed successfully');
        } catch (error) {
            logError(error);
        }
    };

    return <button onClick={handleUserAction}>Click Me</button>;
};
*/

console.log('Example completed! Check the console for Sentry logs.'); 