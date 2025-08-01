# Migration Guide: From Existing Sentry Implementations to SG-Sentry

This guide helps you migrate from existing Sentry implementations in your SG projects to the new unified `sg-sentry` library.

## Migration from sg-game-client logger

### Before (sg-game-client)
```typescript
import { sentryLogger } from './src/shared/utils/logger';

// Initialize
sentryLogger.initialize({
    enabled: true,
    defaultLogLevel: 'info'
});

// Start Sentry
sentryLogger.start('your-sentry-dsn', 'production', 'sg-game-client');

// Logging
sentryLogger.logInfo('ComponentName', 'Message');
sentryLogger.logError('ComponentName', new Error('Error message'));

// Workflow tracking
sentryLogger.startWorkflow('workflow-id', 'Workflow Name', 'ComponentName', { metadata: 'data' });
sentryLogger.updateWorkflow('workflow-id', 'in_progress', { step: 'processing' });
sentryLogger.completeWorkflow('workflow-id', true, { result: 'success' });

// Performance tracking
sentryLogger.trackPerformance('ComponentName', 'operation-name', async () => {
    // Your async operation
    return await someAsyncOperation();
});
```

### After (sg-sentry)
```typescript
import { configureSentry, logInfo, logError, startWorkflow, updateWorkflow, completeWorkflow, trackPerformance } from 'sg-sentry';

// Initialize
configureSentry({
    enabled: true,
    defaultLogLevel: 'info'
});

// Start Sentry (if needed)
// Note: sg-sentry handles Sentry initialization automatically when logging

// Logging
logInfo('ComponentName', 'Message');
logError('ComponentName', new Error('Error message'));

// Workflow tracking
startWorkflow('workflow-id', 'Workflow Name', 'ComponentName', { metadata: 'data' });
updateWorkflow('workflow-id', 'in_progress', { step: 'processing' });
completeWorkflow('workflow-id', true, { result: 'success' });

// Performance tracking
trackPerformance('ComponentName', 'operation-name', async () => {
    // Your async operation
    return await someAsyncOperation();
});
```

## Migration from hot-league-wall sentry

### Before (hot-league-wall)
```typescript
import { sentryHelper } from './src/sentry';

// Initialize
sentryHelper.initialize({
    enabled: true,
    defaultLogLevel: 'info'
});

// Logging
sentryHelper.logInfo('ComponentName', 'Message');
sentryHelper.logError('ComponentName', new Error('Error message'));

// Workflow tracking
sentryHelper.startWorkflow('workflow-id', 'Workflow Name', 'ComponentName', { metadata: 'data' });
sentryHelper.updateWorkflow('workflow-id', 'in_progress', { step: 'processing' });
sentryHelper.completeWorkflow('workflow-id', true, { result: 'success' });

// Performance tracking
sentryHelper.trackPerformance('ComponentName', 'operation-name', async () => {
    // Your async operation
    return await someAsyncOperation();
});
```

### After (sg-sentry)
```typescript
import { configureSentry, logInfo, logError, startWorkflow, updateWorkflow, completeWorkflow, trackPerformance } from 'sg-sentry';

// Initialize
configureSentry({
    enabled: true,
    defaultLogLevel: 'info'
});

// Logging
logInfo('ComponentName', 'Message');
logError('ComponentName', new Error('Error message'));

// Workflow tracking
startWorkflow('workflow-id', 'Workflow Name', 'ComponentName', { metadata: 'data' });
updateWorkflow('workflow-id', 'in_progress', { step: 'processing' });
completeWorkflow('workflow-id', true, { result: 'success' });

// Performance tracking
trackPerformance('ComponentName', 'operation-name', async () => {
    // Your async operation
    return await someAsyncOperation();
});
```

## Migration from saba-games sentry

### Before (saba-games)
```typescript
import { sentryManager } from './src/sentry';

// Initialize
sentryManager.initialize({
    dsn: 'your-sentry-dsn',
    environment: 'production'
});

// Logging
sentryManager.captureError(new Error('Error message'));

// Workflow tracking
sentryManager.startWorkflow('workflow-id', 'Workflow Name', { metadata: 'data' });
sentryManager.updateWorkflow('workflow-id', 'in_progress', { step: 'processing' });
sentryManager.completeWorkflow('workflow-id', true, { result: 'success' });
```

### After (sg-sentry)
```typescript
import { configureSentry, logError, startWorkflow, updateWorkflow, completeWorkflow } from 'sg-sentry';

// Initialize
configureSentry({
    enabled: true,
    defaultLogLevel: 'info'
});

// Logging
logError('ComponentName', new Error('Error message'));

// Workflow tracking
startWorkflow('workflow-id', 'Workflow Name', 'ComponentName', { metadata: 'data' });
updateWorkflow('workflow-id', 'in_progress', { step: 'processing' });
completeWorkflow('workflow-id', true, { result: 'success' });
```

## React Components Migration

### Before (any project)
```typescript
import React from 'react';
import { sentryLogger } from './logger'; // or sentryHelper, etc.

const MyComponent: React.FC = () => {
    const handleClick = () => {
        sentryLogger.logInfo('MyComponent', 'Button clicked');
        // ... rest of the logic
    };

    return <button onClick={handleClick}>Click Me</button>;
};
```

### After (sg-sentry)
```typescript
import React from 'react';
import { useSentryHelper } from 'sg-sentry';

const MyComponent: React.FC = () => {
    const { logInfo } = useSentryHelper({
        componentName: 'MyComponent',
        logLevel: 'info'
    });

    const handleClick = () => {
        logInfo('Button clicked');
        // ... rest of the logic
    };

    return <button onClick={handleClick}>Click Me</button>;
};
```

## Step-by-Step Migration Process

### 1. Install sg-sentry
```bash
npm install sg-sentry
```

### 2. Update imports
Replace all imports from your existing Sentry implementation with imports from `sg-sentry`:

```typescript
// Old imports
import { sentryLogger } from './logger';
import { sentryHelper } from './sentry';
import { sentryManager } from './sentry';

// New imports
import { 
    configureSentry, 
    logInfo, 
    logError, 
    startWorkflow, 
    trackPerformance 
} from 'sg-sentry';
```

### 3. Update initialization
Replace your existing initialization code with `configureSentry`:

```typescript
// Old initialization
sentryLogger.initialize(config);
sentryHelper.initialize(config);
sentryManager.initialize(config);

// New initialization
configureSentry({
    enabled: true,
    defaultLogLevel: 'info',
    enableWorkflowTracking: true,
    enablePerformanceTracking: true
});
```

### 4. Update logging calls
Replace logging method calls:

```typescript
// Old logging
sentryLogger.logInfo('Component', 'Message');
sentryHelper.logInfo('Component', 'Message');

// New logging
logInfo('Component', 'Message');
```

### 5. Update workflow tracking
Replace workflow tracking calls:

```typescript
// Old workflow tracking
sentryLogger.startWorkflow('id', 'name', 'component', metadata);
sentryHelper.startWorkflow('id', 'name', 'component', metadata);

// New workflow tracking
startWorkflow('id', 'name', 'component', metadata);
```

### 6. Update React components
Replace direct logging calls in React components with the `useSentryHelper` hook:

```typescript
// Old React usage
const handleClick = () => {
    sentryLogger.logInfo('MyComponent', 'Button clicked');
};

// New React usage
const { logInfo } = useSentryHelper({ componentName: 'MyComponent' });
const handleClick = () => {
    logInfo('Button clicked');
};
```

### 7. Test thoroughly
After migration, test all logging, workflow tracking, and performance monitoring functionality to ensure everything works as expected.

## Benefits of Migration

1. **Unified API**: Single, consistent interface across all SG projects
2. **Better TypeScript Support**: Full type safety and IntelliSense
3. **React Integration**: Built-in React hooks for easy component integration
4. **Enhanced Features**: Improved workflow tracking, performance monitoring, and configuration management
5. **Better Testing**: Comprehensive test coverage and testing utilities
6. **Maintainability**: Centralized codebase, easier to maintain and update

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure you're importing from `sg-sentry` instead of local files
2. **Type errors**: The new library has stricter typing - check your component names and log levels
3. **Missing functionality**: Some advanced features might have different APIs - check the documentation

### Getting Help

If you encounter issues during migration:
1. Check the [README.md](./README.md) for detailed API documentation
2. Review the [example-usage.ts](./example-usage.ts) file for usage examples
3. Run the test suite to verify your setup: `npm test`
4. Open an issue on the project repository 