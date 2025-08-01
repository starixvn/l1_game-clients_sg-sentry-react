// Initialize Sentry SDK for the demo if not already initialized
if (typeof window !== 'undefined' && window.Sentry && !window.Sentry.getCurrentHub().getClient()) {
  window.Sentry.init({
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
if (window.SGSentry) {
  window.SGSentry.configure({
    enabled: true,
    defaultLogLevel: 'debug',
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: false
  });
  console.log('[React Demo] SG-Sentry configured successfully');
} else {
  console.error('[React Demo] SG-Sentry not available! Make sure demo.js is loaded.');
}

// Demo component with full Sentry integration
const DemoComponent = () => {
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('demo');
  
  // Add log to UI
  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Simulate async operation
  const simulateAsyncOperation = async (operationName, shouldFail = false) => {
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
    if (window.SGSentry) {
      window.SGSentry.logTrace('Trace message from demo component', { count, timestamp: Date.now() });
      window.SGSentry.logDebug('Debug message from demo component', { count });
      window.SGSentry.logInfo('Info message from demo component', { count });
      window.SGSentry.logWarning('Warning message from demo component', { count });
    }
    addLog('Basic logging test completed');
  };

  // Individual log level test functions
  const testTraceLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'trace' };
    if (window.SGSentry) {
      window.SGSentry.logTrace('TRACE level message from demo component', context);
    }
    addLog('TRACE logging test completed');
  };

  const testDebugLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'debug' };
    if (window.SGSentry) {
      window.SGSentry.logDebug('DEBUG level message from demo component', context);
    }
    addLog('DEBUG logging test completed');
  };

  const testInfoLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'info' };
    if (window.SGSentry) {
      window.SGSentry.logInfo('INFO level message from demo component', context);
    }
    addLog('INFO logging test completed');
  };

  const testWarningLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'warning' };
    if (window.SGSentry) {
      window.SGSentry.logWarning('WARNING level message from demo component', context);
    }
    addLog('WARNING logging test completed');
  };

  const testFatalLogging = () => {
    const context = { count, timestamp: Date.now(), level: 'fatal' };
    if (window.SGSentry) {
      window.SGSentry.logFatal('FATAL level message from demo component', context);
    }
    addLog('FATAL logging test completed');
  };

  // Test error logging
  const testErrorLogging = () => {
    try {
      throw new Error('This is a test error for demonstration');
    } catch (error) {
      if (window.SGSentry) {
        window.SGSentry.logError(error, { count, context: 'error-test' });
      }
      addLog('Error logging test completed');
    }
  };

  // Test error capture
  const testErrorCapture = () => {
    if (window.SGSentry) {
      window.SGSentry.captureError(new Error('Captured error test'), { 
        component: 'DemoComponent',
        count,
        context: 'error-capture-test'
      });
    }
    addLog('Error capture test completed');
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
    
    addLog('All test cases completed! Check Sentry dashboard for messages.');
  };

  // Component lifecycle logging
  React.useEffect(() => {
    if (window.SGSentry) {
      window.SGSentry.logInfo('Component mounted', { count: 0 });
      console.log('[React Demo] Component mounted with SG-Sentry');
    } else {
      console.error('[React Demo] SG-Sentry not available during component mount');
    }
    addLog('Component mounted');
    
    return () => {
      if (window.SGSentry) {
        window.SGSentry.logInfo('Component unmounting', { finalCount: count });
      }
    };
  }, []);

  React.useEffect(() => {
    if (window.SGSentry) {
      window.SGSentry.logDebug('Count changed', { newCount: count, previousCount: count - 1 });
    }
  }, [count]);

  return React.createElement('div', {
    style: { 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h1', { key: 'title' }, 'SG-Sentry Demo'),
    React.createElement('p', { key: 'description' }, 'This demo showcases all features of the SG-Sentry library'),
    
    // Tab Navigation
    React.createElement('div', {
      key: 'tabs',
      style: { 
        display: 'flex', 
        marginBottom: '20px', 
        borderBottom: '2px solid #ecf0f1',
        backgroundColor: '#fff',
        borderRadius: '8px 8px 0 0'
      }
    }, [
      React.createElement('button', {
        key: 'demo-tab',
        onClick: () => setActiveTab('demo'),
        style: {
          padding: '15px 30px',
          border: 'none',
          backgroundColor: activeTab === 'demo' ? '#3498db' : '#ecf0f1',
          color: activeTab === 'demo' ? 'white' : '#2c3e50',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: activeTab === 'demo' ? 'bold' : 'normal',
          borderRadius: '8px 8px 0 0',
          transition: 'all 0.3s ease'
        }
      }, '🧪 Basic Demo'),
      React.createElement('button', {
        key: 'game-tab',
        onClick: () => setActiveTab('game'),
        style: {
          padding: '15px 30px',
          border: 'none',
          backgroundColor: activeTab === 'game' ? '#3498db' : '#ecf0f1',
          color: activeTab === 'game' ? 'white' : '#2c3e50',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: activeTab === 'game' ? 'bold' : 'normal',
          borderRadius: '8px 8px 0 0',
          transition: 'all 0.3s ease'
        }
      }, '🎮 Game Demo'),
      React.createElement('button', {
        key: 'board-tab',
        onClick: () => setActiveTab('board'),
        style: {
          padding: '15px 30px',
          border: 'none',
          backgroundColor: activeTab === 'board' ? '#3498db' : '#ecf0f1',
          color: activeTab === 'board' ? 'white' : '#2c3e50',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: activeTab === 'board' ? 'bold' : 'normal',
          borderRadius: '8px 8px 0 0',
          transition: 'all 0.3s ease'
        }
      }, '🎯 Game Board')
    ]),

    // Demo Tab Content
    activeTab === 'demo' && React.createElement('div', {
      key: 'demo-content',
      style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
    }, [
      // Controls Panel
      React.createElement('div', {
        key: 'controls',
        style: { 
          border: '1px solid #ccc', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }
      }, [
        React.createElement('h2', { key: 'controls-title' }, 'Controls'),
        
        React.createElement('div', { key: 'counter', style: { marginBottom: '20px' } }, [
          React.createElement('h3', { key: 'counter-title' }, `Counter: ${count}`),
          React.createElement('button', {
            key: 'increment',
            onClick: () => setCount(c => c + 1),
            style: { marginRight: '10px', padding: '8px 16px' }
          }, 'Increment'),
          React.createElement('button', {
            key: 'reset',
            onClick: () => setCount(0),
            style: { padding: '8px 16px' }
          }, 'Reset')
        ]),

        React.createElement('div', { key: 'basic-tests', style: { marginBottom: '20px' } }, [
          React.createElement('h3', { key: 'basic-title' }, 'Basic Tests'),
          React.createElement('button', {
            key: 'basic-logging',
            onClick: testBasicLogging,
            style: { margin: '5px', padding: '8px 16px' }
          }, 'Test Basic Logging'),
          React.createElement('button', {
            key: 'error-logging',
            onClick: testErrorLogging,
            style: { margin: '5px', padding: '8px 16px' }
          }, 'Test Error Logging'),
          React.createElement('button', {
            key: 'error-capture',
            onClick: testErrorCapture,
            style: { margin: '5px', padding: '8px 16px' }
          }, 'Test Error Capture')
        ]),

        React.createElement('div', { key: 'log-levels', style: { marginBottom: '20px' } }, [
          React.createElement('h3', { key: 'levels-title' }, 'All Log Levels'),
          React.createElement('button', {
            key: 'trace',
            onClick: testTraceLogging,
            style: { margin: '5px', padding: '8px 16px' }
          }, 'Test TRACE'),
          React.createElement('button', {
            key: 'debug',
            onClick: testDebugLogging,
            style: { margin: '5px', padding: '8px 16px' }
          }, 'Test DEBUG'),
          React.createElement('button', {
            key: 'info',
            onClick: testInfoLogging,
            style: { margin: '5px', padding: '8px 16px' }
          }, 'Test INFO'),
          React.createElement('button', {
            key: 'warning',
            onClick: testWarningLogging,
            style: { margin: '5px', padding: '8px 16px', backgroundColor: '#f39c12', color: 'white' }
          }, 'Test WARNING'),
          React.createElement('button', {
            key: 'error',
            onClick: testErrorLogging,
            style: { margin: '5px', padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white' }
          }, 'Test ERROR'),
          React.createElement('button', {
            key: 'fatal',
            onClick: testFatalLogging,
            style: { margin: '5px', padding: '8px 16px', backgroundColor: '#c0392b', color: 'white' }
          }, 'Test FATAL')
        ]),

        React.createElement('div', { key: 'test-all', style: { marginBottom: '20px' } }, [
          React.createElement('h3', { key: 'all-title' }, '🧪 Test All Cases'),
          React.createElement('button', {
            key: 'test-all-btn',
            onClick: testAllCases,
            style: { margin: '5px', padding: '8px 16px', backgroundColor: '#f39c12', color: 'white' }
          }, 'Test All Cases')
        ])
      ]),

      // Logs Panel
      React.createElement('div', {
        key: 'logs',
        style: { 
          border: '1px solid #ccc', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }
      }, [
        React.createElement('h2', { key: 'logs-title' }, 'Activity Logs'),
        React.createElement('div', {
          key: 'logs-container',
          style: { 
            height: '500px', 
            overflowY: 'auto', 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }
        }, logs.length === 0 ? 
          React.createElement('p', { 
            key: 'no-logs',
            style: { color: '#666', fontStyle: 'italic' }
          }, 'No activity yet. Try clicking some buttons!') :
          logs.map((log, index) => 
            React.createElement('div', {
              key: index,
              style: { marginBottom: '5px', wordBreak: 'break-word' }
            }, log)
          )
        ),
        React.createElement('button', {
          key: 'clear-logs',
          onClick: () => setLogs([]),
          style: { marginTop: '10px', padding: '8px 16px' }
        }, 'Clear Logs')
      ])
    ]),

    // Game Tab Content
    activeTab === 'game' && React.createElement('div', {
      key: 'game-content',
      style: { 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }
    }, [
      React.createElement('h2', { key: 'game-title' }, '🎮 Game Demo with Sentry Integration'),
      React.createElement('p', {
        key: 'game-description',
        style: { marginBottom: '20px', color: '#666' }
      }, 'This game demo showcases comprehensive Sentry logging integration with multiple log levels, workflow tracking, and performance monitoring based on the configs.LOCAL_1.json pattern.'),
      React.createElement(GameDemo, {
        key: 'game-demo-component',
        gameId: 'demo-game-001',
        sessionId: `session-${Date.now()}`,
        onGameEnd: () => {
          addLog('Game demo ended');
          if (window.SGSentry) {
            window.SGSentry.logInfo('Game demo session ended', { 
              gameId: 'demo-game-001',
              timestamp: Date.now() 
            });
          }
        }
      })
    ]),

    // Game Board Tab Content
    activeTab === 'board' && React.createElement('div', {
      key: 'board-content',
      style: { 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }
    }, [
      React.createElement('h2', { key: 'board-title' }, '🎯 Game Board Demo with Interactive Pieces'),
      React.createElement('p', {
        key: 'board-description',
        style: { marginBottom: '20px', color: '#666' }
      }, 'This game board demo showcases interactive game pieces with movement controls, real-time logging, and comprehensive Sentry integration. Click on pieces to select them and use the controls to move and interact.'),
      window.GameBoardDemo ? React.createElement(window.GameBoardDemo, {
        key: 'game-board-component',
        gameId: 'demo-game-board-001',
        sessionId: `session-${Date.now()}`,
        onGameEnd: () => {
          addLog('Game board demo ended');
          if (window.SGSentry) {
            window.SGSentry.logInfo('Game board demo session ended', { 
              gameId: 'demo-game-board-001',
              timestamp: Date.now() 
            });
          }
        }
      }) : React.createElement('div', {
        key: 'board-error',
        style: { color: 'red', padding: '20px', textAlign: 'center' }
      }, 'Game Board Demo component not loaded. Please refresh the page.')
    ]),

    // Instructions
    React.createElement('div', {
      key: 'instructions',
      style: { 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#e8f4fd', 
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }
    }, [
      React.createElement('h3', { key: 'instructions-title' }, 'Instructions'),
      React.createElement('ul', { key: 'instructions-list' }, [
        React.createElement('li', { key: 'console' }, 'Open your browser\'s developer console to see detailed Sentry logs'),
        React.createElement('li', { key: 'log-levels' }, 'Try different log levels to see how filtering works'),
        React.createElement('li', { key: 'workflow' }, 'Test workflow tracking to see how complex operations are monitored'),
        React.createElement('li', { key: 'performance' }, 'Use performance tracking to measure operation timing'),
        React.createElement('li', { key: 'errors' }, 'Test error scenarios to see error handling in action'),
        React.createElement('li', { key: 'game-tab' }, 'Switch to the Game Demo tab to see a comprehensive game with Sentry integration')
      ])
    ])
  ]);
};

// Render the demo
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(DemoComponent));
} else {
  console.error('Root element not found');
} 