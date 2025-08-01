# SG-Sentry

A comprehensive Sentry logging and error tracking library for SG projects, providing a unified interface for error monitoring, performance tracking, and workflow management.

## Features

- 🔍 **Comprehensive Error Tracking**: Capture and monitor errors with detailed context
- 📊 **Performance Monitoring**: Track operation performance and identify bottlenecks
- 🔄 **Workflow Tracking**: Monitor complex workflows with state management
- 🎛️ **Configurable Logging**: Per-component log level configuration
- 🎯 **React Hooks**: Easy integration with React components
- 💾 **Local Storage**: Persistent configuration management
- 🔧 **Dependency Injection**: Flexible architecture for testing and customization

## Installation

```bash
npm install sg-sentry
```

## Quick Start

### Basic Usage

```typescript
import { configureSentry, logInfo, logError, startWorkflow } from 'sg-sentry';

// Initialize Sentry
configureSentry({
    enabled: true,
    defaultLogLevel: 'info',
    enableWorkflowTracking: true,
    enablePerformanceTracking: true
});

// Basic logging
logInfo('MyComponent', 'Application started successfully');
logError('MyComponent', new Error('Something went wrong'));

// Workflow tracking
const workflowId = 'user-login-123';
startWorkflow(workflowId, 'User Login', 'AuthComponent', { userId: '123' });
```

### React Integration

```typescript
import React from 'react';
import { useSentryHelper } from 'sg-sentry';

const MyComponent: React.FC = () => {
    const { logInfo, logError, startWorkflow, trackPerformance } = useSentryHelper({
        componentName: 'MyComponent',
        logLevel: 'debug',
        enableWorkflowTracking: true
    });

    const handleUserAction = async () => {
        const workflowId = 'user-action-' + Date.now();
        
        startWorkflow(workflowId, 'User Action', { action: 'button-click' });
        
        try {
            await trackPerformance('api-call', async () => {
                // Your async operation here
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
```

## API Reference

### Core Functions

#### `configureSentry(config)`
Initialize the Sentry system with global configuration.

```typescript
configureSentry({
    enabled: true,
    defaultLogLevel: 'info',
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
    enableConsoleOverride: true
});
```

#### Logging Functions

```typescript
logTrace(componentName, message, context?)
logDebug(componentName, message, context?)
logInfo(componentName, message, context?)
logWarning(componentName, message, context?)
logError(componentName, error, context?)
logFatal(componentName, error, context?)
```

#### Workflow Functions

```typescript
startWorkflow(id, name, component, metadata?)
updateWorkflow(id, state, metadata?)
completeWorkflow(id, success?, metadata?)
```

#### Performance Tracking

```typescript
trackPerformance(component, operation, asyncFunction)
```

### React Hooks

#### `useSentryHelper(options)`
Main hook providing full Sentry functionality.

```typescript
const {
    logInfo,
    logError,
    startWorkflow,
    trackPerformance,
    isLoggingEnabled
} = useSentryHelper({
    componentName: 'MyComponent',
    logLevel: 'debug',
    enableWorkflowTracking: true,
    enablePerformanceTracking: true
});
```

#### `useSimpleSentry(componentName)`
Simplified hook for basic logging only.

#### `useWorkflowSentry(componentName)`
Hook optimized for workflow tracking.

### Configuration

#### Log Levels
- `trace`: Most verbose logging
- `debug`: Debug information
- `info`: General information
- `warn`: Warnings
- `error`: Errors only
- `fatal`: Fatal errors only

#### Workflow States
- `started`: Workflow initiated
- `in_progress`: Workflow running
- `completed`: Workflow finished successfully
- `failed`: Workflow failed
- `cancelled`: Workflow cancelled

## Advanced Usage

### Custom Storage Implementation

```typescript
import { createConfigStorage, LocalStorage } from 'sg-sentry';

class CustomStorage implements IStorage {
    getItem(key: string): string | null { /* implementation */ }
    setItem(key: string, value: string): void { /* implementation */ }
    removeItem(key: string): void { /* implementation */ }
    clear(): void { /* implementation */ }
}

const customConfigStorage = createConfigStorage(new CustomStorage());
```

### Component-Specific Configuration

```typescript
import { configureComponent } from 'sg-sentry';

configureComponent('AuthComponent', {
    logLevel: 'debug',
    enableWorkflowTracking: true,
    enablePerformanceTracking: false
});
```

### Performance Monitoring

```typescript
import { trackPerformance } from 'sg-sentry';

const result = await trackPerformance('MyComponent', 'database-query', async () => {
    return await database.query('SELECT * FROM users');
});
```

## Testing

The library includes comprehensive test coverage and provides utilities for testing:

```typescript
import { resetLogger, resetManager } from 'sg-sentry';

beforeEach(() => {
    resetLogger();
    resetManager();
});
```

## Migration from Existing Sentry Implementations

### From sg-game-client logger

```typescript
// Old way
import { sentryLogger } from './logger';
sentryLogger.logInfo('component', 'message');

// New way
import { logInfo } from 'sg-sentry';
logInfo('component', 'message');
```

### From hot-league-wall sentry

```typescript
// Old way
import { sentryHelper } from './sentry';
sentryHelper.logInfo('component', 'message');

// New way
import { logInfo } from 'sg-sentry';
logInfo('component', 'message');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the SG team. 