<!-- @format -->

# SG-Sentry

A clean, maintainable Sentry logging and error tracking library for SG projects, providing a unified interface for error monitoring, performance tracking, and workflow management.

## 🚀 Features

- 🔍 **Comprehensive Error Tracking**: Capture and monitor errors with detailed context
- 📊 **Performance Monitoring**: Track operation performance and identify bottlenecks
- 🔄 **Workflow Tracking**: Monitor complex workflows with state management
- 🎛️ **Configurable Logging**: Per-component log level configuration
- 🎯 **React Hooks**: Easy integration with React components
- 💾 **Local Storage**: Persistent configuration management
- 🔧 **Clean Architecture**: Well-organized, maintainable code structure
- 📦 **TypeScript**: Full type safety and IntelliSense support

## 📁 Project Structure

```
sg-sentry/
├── src/
│   ├── types/
│   │   └── index.ts              # All TypeScript types and interfaces
│   ├── core/
│   │   ├── manager.ts            # Main SentryManager orchestrator
│   │   ├── logger.ts             # SentryLogger implementation
│   │   ├── workflow.ts           # WorkflowTracker implementation
│   │   └── storage.ts            # Storage and configuration management
│   ├── hooks/
│   │   └── useSentry.ts          # React hooks for easy integration
│   └── index.ts                  # Clean, organized exports
├── demo/
│   ├── index.tsx                 # Comprehensive React demo
│   └── index.html                # Demo HTML host
├── tests/                        # Unit tests
├── package.json
└── README.md
```

## 🛠️ Installation

```bash
npm install sg-sentry
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { configureSentry, logInfo, logError, startWorkflow } from "sg-sentry";

// Initialize Sentry
configureSentry({
  enabled: true,
  defaultLogLevel: "info",
  enableWorkflowTracking: true,
  enablePerformanceTracking: true,
});

// Basic logging
logInfo("MyComponent", "Application started successfully");
logError("MyComponent", new Error("Something went wrong"));

// Workflow tracking
const workflowId = "user-login-123";
startWorkflow(workflowId, "User Login", "AuthComponent", { userId: "123" });
```

### React Integration

```typescript
import React from "react";
import { useSentry } from "sg-sentry";

const MyComponent: React.FC = () => {
  const { logInfo, logError, startWorkflow, trackPerformance } = useSentry({
    componentName: "MyComponent",
    logLevel: "debug",
    enableWorkflowTracking: true,
  });

  const handleUserAction = async () => {
    const workflowId = "user-action-" + Date.now();

    startWorkflow(workflowId, "User Action", { action: "button-click" });

    try {
      await trackPerformance("api-call", async () => {
        const result = await fetch("/api/data");
        return result.json();
      });

      logInfo("User action completed successfully");
    } catch (error) {
      logError(error);
    }
  };

  return <button onClick={handleUserAction}>Click Me</button>;
};
```

## 📚 API Reference

### Core Functions

#### Configuration

```typescript
configureSentry(config); // Initialize Sentry system
enableSentry(); // Enable Sentry globally
disableSentry(); // Disable Sentry globally
setSentryLogLevel(level); // Set global log level
```

#### Logging

```typescript
logTrace(component, message, context?)
logDebug(component, message, context?)
logInfo(component, message, context?)
logWarning(component, message, context?)
logError(component, error, context?)
logFatal(component, error, context?)
```

#### Workflow Tracking

```typescript
startWorkflow(id, name, component, metadata?)
updateWorkflow(id, state, component, metadata?)
completeWorkflow(id, component, success?, metadata?)
```

#### Performance Tracking

```typescript
trackPerformance(component, operation, asyncFunction);
```

### React Hooks

#### `useSentry(options)`

Main hook with full functionality:

```typescript
const sentry = useSentry({
  componentName: "MyComponent",
  logLevel: "debug",
  enableWorkflowTracking: true,
  enablePerformanceTracking: true,
});
```

#### `useSimpleSentry(componentName)`

Simple hook for basic logging only:

```typescript
const sentry = useSimpleSentry("MyComponent");
```

#### `useWorkflowSentry(componentName, logLevel?)`

Hook focused on workflow tracking:

```typescript
const sentry = useWorkflowSentry("MyComponent", "info");
```

### Types

```typescript
enum SentryLogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  FATAL = "fatal",
}

enum WorkflowState {
  STARTED = "started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}
```

## 🎮 Demo

Run the interactive demo to see all features in action:

```bash
# Install dependencies
npm install

# Run the demo
npm run demo

# Or run in watch mode
npm run demo:dev
```

The demo showcases:

- ✅ All logging levels
- ✅ Error handling and capture
- ✅ Workflow tracking
- ✅ Performance monitoring
- ✅ React hooks usage
- ✅ Configuration management
- ✅ Real-time activity logs

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Development

```bash
# Build the library
npm run build

# Build in watch mode
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📋 Configuration Options

### Global Configuration

```typescript
interface GlobalSentryConfig {
  enabled?: boolean;
  defaultLogLevel?: SentryLogLevel;
  enableWorkflowTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableConsoleOverride?: boolean;
  dsn?: string;
  environment?: string;
  release?: string;
}
```

### Component Configuration

```typescript
interface ComponentConfig {
  logLevel?: SentryLogLevel;
  enabled?: boolean;
  enableWorkflowTracking?: boolean;
  enablePerformanceTracking?: boolean;
}
```

## 🔧 Advanced Usage

### Custom Storage Implementation

```typescript
import { IStorage, SentryConfigStorage } from "sg-sentry";

class CustomStorage implements IStorage {
  getItem(key: string): string | null {
    /* implementation */
  }
  setItem(key: string, value: string): void {
    /* implementation */
  }
  removeItem(key: string): void {
    /* implementation */
  }
  clear(): void {
    /* implementation */
  }
}

const configStorage = new SentryConfigStorage(new CustomStorage());
```

### Direct Manager Usage

```typescript
import { SentryManager } from "sg-sentry";

const manager = SentryManager.getInstance();
manager.initialize({
  globalConfig: {
    enabled: true,
    defaultLogLevel: "debug",
  },
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

- Create an issue on GitHub
- Check the demo for usage examples
- Review the test files for implementation details
