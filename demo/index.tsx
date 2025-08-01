import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  configureSentry,
  useSentry,
  useSimpleSentry,
  useWorkflowSentry,
  logInfo,
  logError,
  startWorkflow,
  completeWorkflow,
  trackPerformance,
  captureError,
  SentryLogLevel,
  WorkflowState
} from '../src';

// Configure Sentry for the demo
configureSentry({
  enabled: true,
  defaultLogLevel: SentryLogLevel.DEBUG,
  enableWorkflowTracking: true,
  enablePerformanceTracking: true,
  enableConsoleOverride: false
});

// Demo component with full Sentry integration
const DemoComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Full Sentry hook
  const sentry = useSentry({
    componentName: 'DemoComponent',
    logLevel: SentryLogLevel.DEBUG,
    enableWorkflowTracking: true,
    enablePerformanceTracking: true
  });

  // Simple Sentry hook for basic logging
  const simpleSentry = useSimpleSentry('SimpleDemo');

  // Workflow-focused Sentry hook
  const workflowSentry = useWorkflowSentry('WorkflowDemo', SentryLogLevel.INFO);

  // Add log to UI
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Simulate async operation
  const simulateAsyncOperation = async (operationName: string, shouldFail = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error(`Operation ${operationName} failed`));
        } else {
          resolve(`Operation ${operationName} completed successfully`);
        }
      }, Math.random() * 2000 + 500); // 500-2500ms
    });
  };

  // Test basic logging
  const testBasicLogging = () => {
    sentry.logTrace('Trace message from demo component', { count, timestamp: Date.now() });
    sentry.logDebug('Debug message from demo component', { count });
    sentry.logInfo('Info message from demo component', { count });
    sentry.logWarning('Warning message from demo component', { count });
    
    addLog('Basic logging test completed');
  };

  // Test error logging
  const testErrorLogging = () => {
    try {
      throw new Error('This is a test error for demonstration');
    } catch (error) {
      sentry.logError(error as Error, { count, context: 'error-test' });
      addLog('Error logging test completed');
    }
  };

  // Test workflow tracking
  const testWorkflowTracking = async () => {
    const workflowId = `demo-workflow-${Date.now()}`;
    
    sentry.startWorkflow(workflowId, 'Demo Workflow', { 
      count, 
      userAction: 'workflow-test' 
    });
    
    addLog(`Started workflow: ${workflowId}`);
    
    // Simulate workflow steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    sentry.updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, { step: 'processing' });
    addLog('Workflow updated to IN_PROGRESS');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    sentry.completeWorkflow(workflowId, true, { result: 'success', finalCount: count });
    addLog('Workflow completed successfully');
  };

  // Test performance tracking
  const testPerformanceTracking = async () => {
    setLoading(true);
    
    try {
      const result = await sentry.trackPerformance('demo-operation', async () => {
        return await simulateAsyncOperation('performance-test');
      });
      
      addLog(`Performance tracking completed: ${result}`);
    } catch (error) {
      addLog(`Performance tracking failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Test simple Sentry hook
  const testSimpleSentry = () => {
    simpleSentry.logInfo('Simple logging test');
    simpleSentry.logWarning('Simple warning test');
    addLog('Simple Sentry test completed');
  };

  // Test workflow Sentry hook
  const testWorkflowSentry = async () => {
    const workflowId = `workflow-demo-${Date.now()}`;
    
    workflowSentry.startWorkflow(workflowId, 'Workflow Hook Demo');
    addLog('Workflow hook demo started');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    workflowSentry.completeWorkflow(workflowId, true);
    addLog('Workflow hook demo completed');
  };

  // Test global functions
  const testGlobalFunctions = () => {
    logInfo('GlobalDemo', 'Testing global logging functions');
    startWorkflow('global-workflow', 'Global Workflow Test', 'GlobalDemo');
    
    setTimeout(() => {
      completeWorkflow('global-workflow', 'GlobalDemo', true);
      addLog('Global functions test completed');
    }, 1000);
  };

  // Test error capture
  const testErrorCapture = () => {
    captureError(new Error('Captured error test'), { 
      component: 'DemoComponent',
      count,
      context: 'error-capture-test'
    });
    addLog('Error capture test completed');
  };

  // Test performance with global function
  const testGlobalPerformance = async () => {
    setLoading(true);
    
    try {
      const result = await trackPerformance('GlobalDemo', 'global-performance-test', async () => {
        return await simulateAsyncOperation('global-performance');
      });
      
      addLog(`Global performance test completed: ${result}`);
    } catch (error) {
      addLog(`Global performance test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Test failed operation
  const testFailedOperation = async () => {
    setLoading(true);
    
    try {
      await sentry.trackPerformance('failed-operation', async () => {
        return await simulateAsyncOperation('failed-test', true);
      });
    } catch (error) {
      sentry.logError(error as Error, { context: 'failed-operation-test' });
      addLog('Failed operation test completed (error logged)');
    } finally {
      setLoading(false);
    }
  };

  // Component lifecycle logging
  useEffect(() => {
    sentry.logInfo('Component mounted', { count: 0 });
    addLog('Component mounted');
    
    return () => {
      sentry.logInfo('Component unmounting', { finalCount: count });
    };
  }, []);

  useEffect(() => {
    sentry.logDebug('Count changed', { newCount: count, previousCount: count - 1 });
  }, [count]);

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>SG-Sentry Demo</h1>
      <p>This demo showcases all features of the SG-Sentry library</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Controls Panel */}
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>Controls</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Counter: {count}</h3>
            <button 
              onClick={() => setCount(c => c + 1)}
              style={{ marginRight: '10px', padding: '8px 16px' }}
            >
              Increment
            </button>
            <button 
              onClick={() => setCount(0)}
              style={{ padding: '8px 16px' }}
            >
              Reset
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Basic Tests</h3>
            <button onClick={testBasicLogging} style={{ margin: '5px', padding: '8px 16px' }}>
              Test Basic Logging
            </button>
            <button onClick={testErrorLogging} style={{ margin: '5px', padding: '8px 16px' }}>
              Test Error Logging
            </button>
            <button onClick={testErrorCapture} style={{ margin: '5px', padding: '8px 16px' }}>
              Test Error Capture
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Workflow Tests</h3>
            <button onClick={testWorkflowTracking} style={{ margin: '5px', padding: '8px 16px' }}>
              Test Workflow Tracking
            </button>
            <button onClick={testWorkflowSentry} style={{ margin: '5px', padding: '8px 16px' }}>
              Test Workflow Hook
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Performance Tests</h3>
            <button 
              onClick={testPerformanceTracking} 
              disabled={loading}
              style={{ margin: '5px', padding: '8px 16px' }}
            >
              {loading ? 'Running...' : 'Test Performance Tracking'}
            </button>
            <button 
              onClick={testFailedOperation} 
              disabled={loading}
              style={{ margin: '5px', padding: '8px 16px' }}
            >
              {loading ? 'Running...' : 'Test Failed Operation'}
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Hook Tests</h3>
            <button onClick={testSimpleSentry} style={{ margin: '5px', padding: '8px 16px' }}>
              Test Simple Hook
            </button>
            <button onClick={testGlobalFunctions} style={{ margin: '5px', padding: '8px 16px' }}>
              Test Global Functions
            </button>
            <button 
              onClick={testGlobalPerformance} 
              disabled={loading}
              style={{ margin: '5px', padding: '8px 16px' }}
            >
              {loading ? 'Running...' : 'Test Global Performance'}
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Configuration</h3>
            <button 
              onClick={() => sentry.setLogLevel(SentryLogLevel.TRACE)}
              style={{ margin: '5px', padding: '8px 16px' }}
            >
              Set Log Level: TRACE
            </button>
            <button 
              onClick={() => sentry.setLogLevel(SentryLogLevel.INFO)}
              style={{ margin: '5px', padding: '8px 16px' }}
            >
              Set Log Level: INFO
            </button>
          </div>
        </div>

        {/* Logs Panel */}
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>Activity Logs</h2>
          <div style={{ 
            height: '500px', 
            overflowY: 'auto', 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {logs.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No activity yet. Try clicking some buttons!
              </p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '5px', wordBreak: 'break-word' }}>
                  {log}
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => setLogs([])}
            style={{ marginTop: '10px', padding: '8px 16px' }}
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#e8f4fd', 
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3>Instructions</h3>
        <ul>
          <li>Open your browser's developer console to see detailed Sentry logs</li>
          <li>Try different log levels to see how filtering works</li>
          <li>Test workflow tracking to see how complex operations are monitored</li>
          <li>Use performance tracking to measure operation timing</li>
          <li>Test error scenarios to see error handling in action</li>
        </ul>
      </div>
    </div>
  );
};

// Render the demo
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DemoComponent />);
} else {
  console.error('Root element not found');
} 