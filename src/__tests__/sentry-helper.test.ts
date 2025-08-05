import { SentryHelper } from '../sentry/utils/sentry-helper';
import { SentryLogLevel, WorkflowState } from '../core/sentry-types';

describe('SentryHelper', () => {
    let sentryHelper: SentryHelper;

    beforeEach(() => {
        // Arrange: Get instance and reset for each test
        sentryHelper = SentryHelper.getInstance();
        sentryHelper.cleanup();
        sentryHelper = SentryHelper.getInstance();
    });

    afterEach(() => {
        // Cleanup after each test
        sentryHelper.cleanup();
    });

    describe('getInstance', () => {
        it('should return the same instance when called multiple times', () => {
            // Act
            const instance1 = SentryHelper.getInstance();
            const instance2 = SentryHelper.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
        });
    });

    describe('initialize', () => {
        it('should initialize with default config when no config provided', () => {
            // Act
            sentryHelper.initialize();

            // Assert
            const config = sentryHelper.getConfig();
            expect(config.enabled).toBe(true);
            expect(config.defaultLogLevel).toBe(SentryLogLevel.ERROR);
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

        it('should warn when already initialized', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            sentryHelper.initialize();

            // Act
            sentryHelper.initialize();

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('SentryHelper already initialized');
            consoleSpy.mockRestore();
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

        it('should use default config when partial config provided', () => {
            // Arrange
            const componentName = 'TestComponent';
            const componentConfig = {
                enableWorkflowTracking: true
            };

            // Act
            sentryHelper.configureComponent(componentName, componentConfig);

            // Assert
            const config = sentryHelper.getComponentConfig(componentName);
            expect(config?.logLevel).toBe(SentryLogLevel.ERROR); // Default from global config
            expect(config?.enableWorkflowTracking).toBe(true);
        });
    });

    describe('isLoggingEnabled', () => {
        it('should return false when component not configured', () => {
            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('UnknownComponent', SentryLogLevel.INFO)).toBe(false);
        });

        it('should return true when component configured and level enabled', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', { logLevel: SentryLogLevel.INFO });

            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', SentryLogLevel.INFO)).toBe(true);
            expect(sentryHelper.isLoggingEnabled('TestComponent', SentryLogLevel.ERROR)).toBe(true);
        });

        it('should return false when level disabled', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', { logLevel: SentryLogLevel.ERROR });

            // Act & Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', SentryLogLevel.INFO)).toBe(false);
            expect(sentryHelper.isLoggingEnabled('TestComponent', SentryLogLevel.DEBUG)).toBe(false);
        });
    });

    describe('workflow tracking', () => {
        it('should start workflow successfully', () => {
            // Arrange
            const componentName = 'TestComponent';
            sentryHelper.configureComponent(componentName, { enableWorkflowTracking: true });

            // Act
            sentryHelper.startWorkflow('test-workflow', 'Test Workflow', componentName, { test: 'data' });

            // Assert - No error should be thrown
            expect(() => {
                sentryHelper.updateWorkflow('test-workflow', WorkflowState.IN_PROGRESS);
            }).not.toThrow();
        });

        it('should complete workflow successfully', () => {
            // Arrange
            const componentName = 'TestComponent';
            sentryHelper.configureComponent(componentName, { enableWorkflowTracking: true });
            sentryHelper.startWorkflow('test-workflow', 'Test Workflow', componentName);

            // Act & Assert - No error should be thrown
            expect(() => {
                sentryHelper.completeWorkflow('test-workflow', true, { result: 'success' });
            }).not.toThrow();
        });
    });

    describe('performance tracking', () => {
        it('should track performance successfully', async () => {
            // Arrange
            const componentName = 'TestComponent';
            sentryHelper.configureComponent(componentName, { enablePerformanceTracking: true });
            const mockOperation = jest.fn().mockResolvedValue('test result');

            // Act
            const result = await sentryHelper.trackPerformance(componentName, 'test-operation', mockOperation);

            // Assert
            expect(result).toBe('test result');
            expect(mockOperation).toHaveBeenCalled();
        });

        it('should handle performance tracking errors', async () => {
            // Arrange
            const componentName = 'TestComponent';
            sentryHelper.configureComponent(componentName, { enablePerformanceTracking: true });
            const mockOperation = jest.fn().mockRejectedValue(new Error('Test error'));

            // Act & Assert
            await expect(sentryHelper.trackPerformance(componentName, 'test-operation', mockOperation))
                .rejects.toThrow('Test error');
        });
    });

    describe('logging methods', () => {
        beforeEach(() => {
            sentryHelper.configureComponent('TestComponent', { logLevel: SentryLogLevel.ALL });
        });

        it('should log error without throwing', () => {
            // Act & Assert
            expect(() => {
                sentryHelper.logError('TestComponent', 'Test error message');
            }).not.toThrow();
        });

        it('should log warning without throwing', () => {
            // Act & Assert
            expect(() => {
                sentryHelper.logWarning('TestComponent', 'Test warning message');
            }).not.toThrow();
        });

        it('should log info without throwing', () => {
            // Act & Assert
            expect(() => {
                sentryHelper.logInfo('TestComponent', 'Test info message');
            }).not.toThrow();
        });

        it('should log debug without throwing', () => {
            // Act & Assert
            expect(() => {
                sentryHelper.logDebug('TestComponent', 'Test debug message');
            }).not.toThrow();
        });

        it('should log trace without throwing', () => {
            // Act & Assert
            expect(() => {
                sentryHelper.logTrace('TestComponent', 'Test trace message');
            }).not.toThrow();
        });
    });

    describe('configuration management', () => {
        it('should update sentry configuration', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

            // Act
            sentryHelper.updateSentryConfiguration('test-dsn', 'test-env');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Sentry configuration updated', {
                dsn: 'test-dsn',
                environment: 'test-env'
            });
            consoleSpy.mockRestore();
        });

        it('should get all component configs', () => {
            // Arrange
            sentryHelper.configureComponent('Component1', { logLevel: SentryLogLevel.INFO });
            sentryHelper.configureComponent('Component2', { logLevel: SentryLogLevel.ERROR });

            // Act
            const configs = sentryHelper.getAllComponentConfigs();

            // Assert
            expect(configs).toHaveProperty('Component1');
            expect(configs).toHaveProperty('Component2');
            expect(configs.Component1.logLevel).toBe(SentryLogLevel.INFO);
            expect(configs.Component2.logLevel).toBe(SentryLogLevel.ERROR);
        });
    });

    describe('cleanup', () => {
        it('should cleanup resources', () => {
            // Arrange
            sentryHelper.configureComponent('TestComponent', { logLevel: SentryLogLevel.INFO });

            // Act
            sentryHelper.cleanup();

            // Assert
            expect(sentryHelper.isLoggingEnabled('TestComponent', SentryLogLevel.INFO)).toBe(false);
        });
    });
}); 