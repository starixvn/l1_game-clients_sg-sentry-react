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
import { GameDemo } from '../src/components/GameDemo';

// Initialize Sentry SDK for the demo if not already initialized
if (typeof window !== 'undefined' && (window as any).Sentry && !(window as any).Sentry.getCurrentHub().getClient()) {
  (window as any).Sentry.init({
    dsn: 'https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056',
    environment: 'demo',
    release: '1.0.0',
    debug: true,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0
  });
  console.log('[Demo] Sentry SDK initialized successfully');
}

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
  const [activeTab, setActiveTab] = useState<'demo' | 'game'>('demo');
  
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

  // Individual log level test functions
  const testTraceLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'trace' };
    sentry.logTrace('TRACE level message from demo component', context);
    addLog('TRACE logging test completed');
  };

  const testDebugLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'debug' };
    sentry.logDebug('DEBUG level message from demo component', context);
    addLog('DEBUG logging test completed');
  };

  const testInfoLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'info' };
    sentry.logInfo('INFO level message from demo component', context);
    addLog('INFO logging test completed');
  };

  const testWarningLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'warning' };
    sentry.logWarning('WARNING level message from demo component', context);
    addLog('WARNING logging test completed');
  };

  const testFatalLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'fatal' };
    sentry.logFatal('FATAL level message from demo component', context);
    addLog('FATAL logging test completed');
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

  // Test all cases function
  const testAllCases = async () => {
    addLog('Starting comprehensive test of all cases...');
    
    // Test all log levels
    testTraceLogging();
    await new Promise(resolve => setTimeout(resolve, 300));
    testDebugLogging();
    await new Promise(resolve => setTimeout(resolve, 300));
    testInfoLogging();
    await new Promise(resolve => setTimeout(resolve, 300));
    testWarningLogging();
    await new Promise(resolve => setTimeout(resolve, 300));
    testErrorLogging();
    await new Promise(resolve => setTimeout(resolve, 300));
    testFatalLogging();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Test basic logging
    testBasicLogging();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test error capture
    testErrorCapture();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test workflow tracking
    testWorkflowTracking();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test workflow Sentry hook
    testWorkflowSentry();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test performance tracking
    testPerformanceTracking();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test failed operation
    testFailedOperation();
    
    addLog('All test cases completed! Check Sentry dashboard for messages.');
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
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '20px', 
        borderBottom: '2px solid #ecf0f1',
        backgroundColor: '#fff',
        borderRadius: '8px 8px 0 0'
      }}>
        <button
          onClick={() => setActiveTab('demo')}
          style={{
            padding: '15px 30px',
            border: 'none',
            backgroundColor: activeTab === 'demo' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'demo' ? 'white' : '#2c3e50',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'demo' ? 'bold' : 'normal',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s ease'
          }}
        >
          🧪 Basic Demo
        </button>
        <button
          onClick={() => setActiveTab('game')}
          style={{
            padding: '15px 30px',
            border: 'none',
            backgroundColor: activeTab === 'game' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'game' ? 'white' : '#2c3e50',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'game' ? 'bold' : 'normal',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s ease'
          }}
        >
          🎮 Game Demo
        </button>
      </div>

      {activeTab === 'demo' && (
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
            <h3>All Log Levels</h3>
            <button onClick={testTraceLogging} style={{ margin: '5px', padding: '8px 16px' }}>
              Test TRACE
            </button>
            <button onClick={testDebugLogging} style={{ margin: '5px', padding: '8px 16px' }}>
              Test DEBUG
            </button>
            <button onClick={testInfoLogging} style={{ margin: '5px', padding: '8px 16px' }}>
              Test INFO
            </button>
            <button onClick={testWarningLogging} style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#f39c12', color: 'white' }}>
              Test WARNING
            </button>
            <button onClick={testErrorLogging} style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white' }}>
              Test ERROR
            </button>
            <button onClick={testFatalLogging} style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#c0392b', color: 'white' }}>
              Test FATAL
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

          <div style={{ marginBottom: '20px' }}>
            <h3>🧪 Test All Cases</h3>
            <button 
              onClick={testAllCases}
              style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#f39c12', color: 'white' }}
            >
              Test All Cases
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
      )}

      {activeTab === 'game' && (
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>🎮 Game Demo with Sentry Integration</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            This game demo showcases comprehensive Sentry logging integration with multiple log levels,
            workflow tracking, and performance monitoring based on the configs.LOCAL_1.json pattern.
          </p>
          <GameDemo 
            gameId="demo-game-001"
            sessionId={`session-${Date.now()}`}
            onGameEnd={() => {
              addLog('Game demo ended');
              sentry.logInfo('Game demo session ended', { 
                gameId: 'demo-game-001',
                timestamp: Date.now() 
              });
            }}
          />
        </div>
      )}

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
          <li>Switch to the Game Demo tab to see a comprehensive game with Sentry integration</li>
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