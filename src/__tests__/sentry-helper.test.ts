import { SentryHelper } from '../utils/sentry-helper';
import { SentryLogLevel, WorkflowState } from '../core/sentry-types';

describe('SentryHelper', () => {
    let sentryHelper: SentryHelper;

    beforeEach(() => {
        // Arrange: Reset instance and create new one for each test
        SentryHelper.resetInstance();
        sentryHelper = SentryHelper.getInstance();
    });

    afterEach(() => {
        // Cleanup after each test
        SentryHelper.resetInstance();
    });

    describe('getInstance', () => {
        it('should return the same instance when called multiple times', () => {
            // Act
            const instance1 = SentryHelper.getInstance();
            const instance2 = SentryHelper.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
        });

        it('should create a new instance after reset', () => {
            // Arrange
            const instance1 = SentryHelper.getInstance();
            
            // Act
            SentryHelper.resetInstance();
            const instance2 = SentryHelper.getInstance();

            // Assert
            expect(instance1).not.toBe(instance2);
        });
    });

    describe('initialize', () => {
        it('should initialize with default config when no config provided', () => {
            // Act
            sentryHelper.initialize();

            // Assert
            const config = sentryHelper.getConfig();
            expect(config.enabled).toBe(true);
            expect(config.defaultLogLevel).toBe(SentryLogLevel.INFO);
        });

        it('should initialize with provided config', () => {
            // Arrange
            const testConfig = {
                enabled: false,
                defaultLogLevel: SentryLogLevel.DEBUG,
                enableWorkflowTracking: false
            };

            // Act
            sentryHelper.initialize(testConfig);

            // Assert
            const config = sentryHelper.getConfig();
            expect(config.enabled).toBe(false);
            expect(config.defaultLogLevel).toBe(SentryLogLevel.DEBUG);
            expect(config.enableWorkflowTracking).toBe(false);
        });
    });

    describe('configureComponent', () => {
        it('should configure component with provided settings', () => {
            // Arrange
            const componentName = 'TestComponent';
            const componentConfig = {
                logLevel: SentryLogLevel.DEBUG,
                enableWorkflowTracking: true
            };

            // Act
            sentryHelper.configureComponent(componentName, componentConfig);

            // Assert
            const config = sentryHelper.getComponentConfig(componentName);
            expect(config?.logLevel).toBe(SentryLogLevel.DEBUG);
            expect(config?.enableWorkflowTracking).toBe(true);
        });

        it('should merge with existing component config', () => {
            // Arrange
            const componentName = 'TestComponent';
            const initialConfig = { logLevel: SentryLogLevel.INFO };
            const updatedConfig = { enableWorkflowTracking: true };

            // Act
            sentryHelper.configureComponent(componentName, initialConfig);
            sentryHelper.configureComponent(componentName, updatedConfig);

            // Assert
            const config = sentryHelper.getComponentConfig(componentName);
            expect(config?.logLevel).toBe(SentryLogLevel.INFO);
            expect(config?.enableWorkflowTracking).toBe(true);
        });
    });

    describe('isLoggingEnabled', () => {
        beforeEach(() => {
            sentryHelper.initialize({ enabled: true });
        });

        it('should return false when Sentry is disabled', () => {
            // Arrange
            sentryHelper.setGlobalEnabled(false);

            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'info')).toBe(false);
        });

        it('should respect log level hierarchy', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', { logLevel: SentryLogLevel.WARN });

            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'error')).toBe(true);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'warn')).toBe(true);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'info')).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'debug')).toBe(false);
        });

        it('should handle legacy log levels', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', { logLevel: SentryLogLevel.ERROR_ONLY });

            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'error')).toBe(true);
            expect(sentryHelper.isLoggingEnabled('TestComponent', 'info')).toBe(false);
        });
    });

    describe('workflow tracking', () => {
        beforeEach(() => {
            sentryHelper.initialize({ enableWorkflowTracking: true });
        });

        it('should start workflow correctly', () => {
            // Arrange
            const workflowId = 'test-workflow-1';
            const workflowName = 'Test Workflow';
            const componentName = 'TestComponent';
            const metadata = { test: 'data' };

            // Act
            sentryHelper.startWorkflow(workflowId, workflowName, componentName, metadata);

            // Assert
            const activeWorkflows = sentryHelper.getActiveWorkflows();
            expect(activeWorkflows.has(workflowId)).toBe(true);
        });

        it('should update workflow correctly', () => {
            // Arrange
            const workflowId = 'test-workflow-2';
            sentryHelper.startWorkflow(workflowId, 'Test Workflow', 'TestComponent');

            // Act
            sentryHelper.updateWorkflow(workflowId, WorkflowState.IN_PROGRESS, { progress: 50 });

            // Assert
            const activeWorkflows = sentryHelper.getActiveWorkflows();
            const workflow = activeWorkflows.get(workflowId);
            expect(workflow?.metadata.progress).toBe(50);
        });

        it('should complete workflow correctly', () => {
            // Arrange
            const workflowId = 'test-workflow-3';
            sentryHelper.startWorkflow(workflowId, 'Test Workflow', 'TestComponent');

            // Act
            sentryHelper.completeWorkflow(workflowId, true, { result: 'success' });

            // Assert
            const activeWorkflows = sentryHelper.getActiveWorkflows();
            expect(activeWorkflows.has(workflowId)).toBe(false);
        });

        it('should handle non-existent workflow gracefully', () => {
            // Act & Assert - should not throw
            expect(() => {
                sentryHelper.updateWorkflow('non-existent', WorkflowState.IN_PROGRESS);
            }).not.toThrow();
        });
    });

    describe('performance tracking', () => {
        beforeEach(() => {
            sentryHelper.initialize({ enablePerformanceTracking: true });
        });

        it('should track successful performance operation', async () => {
            // Arrange
            const componentName = 'TestComponent';
            const operationName = 'test-operation';
            const mockOperation = jest.fn().mockResolvedValue('success');

            // Act
            const result = await sentryHelper.trackPerformance(componentName, operationName, mockOperation);

            // Assert
            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });

        it('should track failed performance operation', async () => {
            // Arrange
            const componentName = 'TestComponent';
            const operationName = 'test-operation';
            const mockError = new Error('Test error');
            const mockOperation = jest.fn().mockRejectedValue(mockError);

            // Act & Assert
            await expect(sentryHelper.trackPerformance(componentName, operationName, mockOperation))
                .rejects.toThrow('Test error');
        });

        it('should skip performance tracking when disabled', async () => {
            // Arrange
            sentryHelper.initialize({ enablePerformanceTracking: false });
            const mockOperation = jest.fn().mockResolvedValue('success');

            // Act
            const result = await sentryHelper.trackPerformance('TestComponent', 'test-operation', mockOperation);

            // Assert
            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
    });

    describe('logging methods', () => {
        beforeEach(() => {
            sentryHelper.initialize({ enabled: true });
            sentryHelper.configureComponent('TestComponent', { logLevel: SentryLogLevel.TRACE });
        });

        it('should log trace messages when enabled', () => {
            // Act
            sentryHelper.logTrace('TestComponent', 'Trace message', { context: 'data' });

            // Assert - should not throw and should call Sentry if available
            expect(() => sentryHelper.logTrace('TestComponent', 'Trace message')).not.toThrow();
        });

        it('should log debug messages when enabled', () => {
            // Act & Assert
            expect(() => sentryHelper.logDebug('TestComponent', 'Debug message')).not.toThrow();
        });

        it('should log info messages when enabled', () => {
            // Act & Assert
            expect(() => sentryHelper.logInfo('TestComponent', 'Info message')).not.toThrow();
        });

        it('should log warning messages when enabled', () => {
            // Act & Assert
            expect(() => sentryHelper.logWarning('TestComponent', 'Warning message')).not.toThrow();
        });

        it('should log error messages when enabled', () => {
            // Act & Assert
            expect(() => sentryHelper.logError('TestComponent', 'Error message')).not.toThrow();
            expect(() => sentryHelper.logError('TestComponent', new Error('Test error'))).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle null/undefined inputs gracefully', () => {
            // Act & Assert
            expect(() => sentryHelper.configureComponent('', {})).not.toThrow();
            expect(() => sentryHelper.logInfo('', '')).not.toThrow();
            expect(() => sentryHelper.startWorkflow('', '', '')).not.toThrow();
        });

        it('should handle missing Sentry global gracefully', () => {
            // Arrange
            const originalSentry = (globalThis as any).Sentry;
            delete (globalThis as any).Sentry;

            // Act & Assert
            expect(() => sentryHelper.logInfo('TestComponent', 'Test message')).not.toThrow();

            // Cleanup
            (globalThis as any).Sentry = originalSentry;
        });
    });

    describe('cleanup', () => {
        it('should clean up resources correctly', () => {
            // Arrange
            sentryHelper.startWorkflow('test-workflow', 'Test Workflow', 'TestComponent');

            // Act
            sentryHelper.cleanup();

            // Assert
            const activeWorkflows = sentryHelper.getActiveWorkflows();
            expect(activeWorkflows.size).toBe(0);
        });
    });
}); 