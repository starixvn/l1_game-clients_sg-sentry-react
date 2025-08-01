<!-- @format -->

# SG-Sentry Next.js Demo

A modern Next.js TypeScript demo application showcasing the SG-Sentry library with component-based configuration system, similar to the hot-league-wall project structure.

## 🚀 Features

- **Next.js 14** with TypeScript and App Router
- **Component-based Configuration** - Each component has its own Sentry configuration
- **Tabbed Interface** - Multiple demo sections in a single application
- **Error Simulation** - Test various error types and logging levels
- **Log Viewer** - Real-time log display with filtering capabilities
- **Configuration Panel** - Dynamic component configuration management
- **Game Board** - Interactive game demonstrating workflow tracking
- **Workflow Tracker** - Multi-step workflow simulation
- **Performance Monitor** - Performance tracking and metrics visualization
- **Tailwind CSS** - Modern, responsive UI design

## 📁 Project Structure

```
demo-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles with Tailwind
│   │   ├── layout.tsx         # Root layout with Sentry provider
│   │   └── page.tsx           # Main page with tab navigation
│   ├── components/            # React components
│   │   ├── providers/         # Context providers
│   │   │   └── SentryProvider.tsx
│   │   ├── DemoLayout.tsx     # Main layout component
│   │   ├── ErrorSimulator.tsx # Error simulation component
│   │   ├── LogViewer.tsx      # Log viewing component
│   │   ├── ConfigurationPanel.tsx # Configuration management
│   │   ├── GameBoard.tsx      # Interactive game component
│   │   ├── WorkflowTracker.tsx # Workflow tracking demo
│   │   └── PerformanceMonitor.tsx # Performance monitoring
│   └── configs/               # Configuration files
│       ├── app-settings.ts    # App settings and configuration
│       ├── configs.json       # Main configuration
│       ├── sg/                # SG-specific configs
│       └── vg/                # VG-specific configs
├── package.json               # Dependencies and scripts
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🛠️ Installation

1. **Navigate to the demo directory:**

   ```bash
   cd sg-sentry-dev/demo-nextjs
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Demo Sections

### 1. Error Simulator 🚨

- Simulate various error types (JavaScript, Network, Validation, etc.)
- Test different logging levels (trace, debug, info, warning, error, fatal)
- Real-time error display and Sentry integration
- Component-specific error handling

### 2. Log Viewer 📋

- Real-time log display with filtering
- Filter by log level and component
- Test log generation for all levels
- Auto-scroll and log management

### 3. Configuration Panel ⚙️

- View and modify component configurations
- Dynamic configuration updates
- System and simulator configuration display
- Environment information

### 4. Game Board 🎮

- Interactive game with player movement
- Workflow tracking demonstration
- Performance monitoring
- Collision detection and scoring

### 5. Workflow Tracker 🔄

- Predefined workflow templates
- Step-by-step execution tracking
- Real-time progress visualization
- Workflow history and statistics

### 6. Performance Monitor ⚡

- Performance test categories
- Batch performance testing
- Real-time metrics display
- Performance statistics and analysis

## 🔧 Configuration System

The demo uses a component-based configuration system similar to hot-league-wall:

### Configuration Structure

```json
{
  "sentry": {
    "dsn": "your-sentry-dsn",
    "environment": "LOCAL1",
    "logLevel": "debug",
    "componentLogging": {
      "enabled": true,
      "defaultLogLevel": "debug",
      "components": {
        "ComponentName": {
          "logLevel": "debug",
          "enableWorkflowTracking": true,
          "enablePerformanceTracking": true
        }
      }
    }
  }
}
```

### Environment-Specific Configs

- `configs/sg/configs.LOCAL_1.json` - SG environment configuration
- `configs/vg/configs.LOCAL_1.json` - VG environment configuration

### Component Configuration

Each component can have its own:

- **Log Level** - Controls logging verbosity
- **Workflow Tracking** - Enable/disable workflow tracking
- **Performance Tracking** - Enable/disable performance monitoring

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional interface with Tailwind CSS
- **Interactive Elements** - Hover effects, animations, and transitions
- **Real-time Updates** - Live data updates and status indicators
- **Accessibility** - Proper ARIA labels and keyboard navigation

## 🔍 Usage Examples

### Basic Error Simulation

```typescript
import { logError, captureError } from "sg-sentry";

// Simulate an error
try {
  throw new Error("Simulated error");
} catch (error) {
  logError("MyComponent", error, { context: "additional info" });
  captureError(error, { tags: { component: "MyComponent" } });
}
```

### Workflow Tracking

```typescript
import { startWorkflow, updateWorkflow, completeWorkflow } from "sg-sentry";

const workflowId = "my-workflow-123";
startWorkflow(workflowId, "My Workflow", "MyComponent", { metadata: "info" });

// Update workflow status
updateWorkflow(workflowId, "running", "MyComponent", { step: 2 });

// Complete workflow
completeWorkflow(workflowId, "MyComponent", true, { result: "success" });
```

### Performance Tracking

```typescript
import { trackPerformance } from "sg-sentry";

await trackPerformance("MyComponent", "expensive-operation", async () => {
  // Your expensive operation here
  await someAsyncOperation();
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔗 Integration with Other Projects

This demo shows how to integrate SG-Sentry into other React/Next.js projects:

1. **Install SG-Sentry:**

   ```bash
   npm install sg-sentry
   ```

2. **Import and configure:**

   ```typescript
   import { configureSentry, logInfo } from "sg-sentry";

   configureSentry({
     dsn: "your-sentry-dsn",
     environment: "production",
     componentLogging: {
       enabled: true,
       components: {
         MyComponent: {
           logLevel: "info",
           enableWorkflowTracking: true,
           enablePerformanceTracking: true,
         },
       },
     },
   });
   ```

3. **Use in components:**

   ```typescript
   import { logInfo, trackPerformance } from "sg-sentry";

   function MyComponent() {
     logInfo("MyComponent", "Component rendered");

     const handleClick = async () => {
       await trackPerformance("MyComponent", "button-click", async () => {
         // Handle click
       });
     };
   }
   ```

## 🎯 Key Benefits

- **Component-Level Control** - Each component can have its own Sentry configuration
- **Environment Flexibility** - Easy switching between different environments
- **Real-time Monitoring** - Live logging and performance tracking
- **Developer Experience** - Intuitive interface for testing and debugging
- **Production Ready** - Built with modern best practices and TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This demo is part of the SG-Sentry project and follows the same license terms.
