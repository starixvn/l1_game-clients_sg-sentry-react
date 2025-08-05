import { SentryManager } from '../core/sentry-manager';
import { SentryHelper } from '../utils/sentry-helper';
import { SentryLogger } from '../core/logger/sentry-logger';
import { WorkflowTracker } from '../core/workflow/workflow-tracker';
import { ConsoleOverride } from '../core/console/console-override';
import { SentryConfigStorage } from '../core/storage/local-storage';
import { LocalStorage } from '../core/storage/local-storage';
import { SentryLogLevel, WorkflowState } from '../core/sentry-types';

// Mock Sentry
jest.mock('@sentry/react', () => ({
    init: jest.fn(),
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
    close: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Sentry - SOLID Principles Implementation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset singleton instances
        (SentryManager as any).instance = undefined;
        (SentryHelper as any).instance = undefined;
    });

    describe('SentryManager', () => {
        describe('Single Responsibility Principle', () => {
            it('should delegate logging to SentryLogger', () => {
                // Arrange
                const manager = SentryManager.getInstance();
                const mockLogger = {
                    logInfo: jest.fn(),
                    logError: jest.fn(),
                    logWarning: jest.fn(),
                    logDebug: jest.fn(),
                    logTrace: jest.fn(),
                    logFatal: jest.fn(),
                    isLoggingEnabled: jest.fn().mockReturnValue(true)
                };

                // Act
                manager['logger'] = mockLogger;
                manager.logInfo('test message');
                manager.logError('test error');

                // Assert
                expect(mockLogger.logInfo).toHaveBeenCalledWith('test message', undefined);
                expect(mockLogger.logError).toHaveBeenCalledWith('test error', undefined);
            });

            it('should delegate workflow tracking to WorkflowTracker', () => {
                // Arrange
                const manager = SentryManager.getInstance();
                const mockTracker = {
                    startWorkflow: jest.fn(),
                    updateWorkflow: jest.fn(),
                    completeWorkflow: jest.fn(),
                    trackPerformance: jest.fn()
                };

                // Act
                manager['workflowTracker'] = mockTracker;
                manager.startWorkflow('test-id', 'test-workflow');
                manager.updateWorkflow('test-id', WorkflowState.IN_PROGRESS);

                // Assert
                expect(mockTracker.startWorkflow).toHaveBeenCalledWith('test-id', 'test-workflow', undefined);
                expect(mockTracker.updateWorkflow).toHaveBeenCalledWith('test-id', WorkflowState.IN_PROGRESS, undefined);
            });
        });

        describe('Dependency Inversion Principle', () => {
            it('should use interfaces instead of concrete implementations', () => {
                // Arrange
                const mockLogger = {
                    logInfo: jest.fn(),
                    logError: jest.fn(),
                    logWarning: jest.fn(),
                    logDebug: jest.fn(),
                    logTrace: jest.fn(),
                    logFatal: jest.fn(),
                    isLoggingEnabled: jest.fn().mockReturnValue(true)
                };

                const mockTracker = {
                    startWorkflow: jest.fn(),
                    updateWorkflow: jest.fn(),
                    completeWorkflow: jest.fn(),
                    trackPerformance: jest.fn()
                };

                const mockConsoleOverride = {
                    override: jest.fn(),
                    restore: jest.fn(),
                    isOverridden: jest.fn().mockReturnValue(false)
                };

                const mockConfigStorage = {
                    getLogLevel: jest.fn(),
                    setLogLevel: jest.fn(),
                    isEnabled: jest.fn(),
                    setEnabled: jest.fn(),
                    isDebugMode: jest.fn(),
                    setDebugMode: jest.fn(),
                    getComponentLogLevel: jest.fn(),
                    setComponentLogLevel: jest.fn(),
                    isComponentEnabled: jest.fn(),
                    setComponentEnabled: jest.fn(),
                    clear: jest.fn(),
                    clearComponent: jest.fn()
                };

                // Act & Assert - Should not throw when using interfaces
                expect(() => {
                    new SentryManager(mockLogger, mockTracker, mockConsoleOverride, mockConfigStorage);
                }).not.toThrow();
            });
        });

        describe('Open/Closed Principle', () => {
            it('should be extensible without modification', () => {
                // Arrange
                const manager = SentryManager.getInstance();

                // Act & Assert - Should be able to configure without modifying the class
                expect(() => {
                    manager.configureComponent({
                        logLevel: SentryLogLevel.DEBUG,
                        enableWorkflowTracking: true,
                        enablePerformanceTracking: false
                    });
                }).not.toThrow();
            });
        });

        describe('Liskov Substitution Principle', () => {
            it('should work with different logger implementations', () => {
                // Arrange
                const manager = SentryManager.getInstance();
                const customLogger = {
                    logInfo: jest.fn(),
                    logError: jest.fn(),
                    logWarning: jest.fn(),
                    logDebug: jest.fn(),
                    logTrace: jest.fn(),
                    logFatal: jest.fn(),
                    isLoggingEnabled: jest.fn().mockReturnValue(true)
                };

                // Act
                manager['logger'] = customLogger;
                manager.logInfo('test message');

                // Assert
                expect(customLogger.logInfo).toHaveBeenCalledWith('test message', undefined);
            });
        });

        describe('Interface Segregation Principle', () => {
            it('should use specific interfaces for different concerns', () => {
                // Arrange
                const manager = SentryManager.getInstance();

                // Act & Assert - Should have separate interfaces for different concerns
                expect(manager['logger']).toBeDefined();
                expect(manager['workflowTracker']).toBeDefined();
                expect(manager['consoleOverride']).toBeDefined();
                expect(manager['configStorage']).toBeDefined();
            });
        });
    });

    describe('SentryHelper', () => {
        describe('Single Responsibility Principle', () => {
            it('should manage component-specific operations', () => {
                // Arrange
                const helper = SentryHelper.getInstance();

                // Act
                helper.configureComponent('TestComponent', {
                    logLevel: SentryLogLevel.INFO,
                    enableWorkflowTracking: true
                });

                // Assert
                const config = helper.getComponentConfig('TestComponent');
                expect(config?.name).toBe('TestComponent');
                expect(config?.logLevel).toBe(SentryLogLevel.INFO);
            });
        });

        describe('Dependency Inversion Principle', () => {
            it('should depend on abstractions', () => {
                // Arrange
                const helper = SentryHelper.getInstance();

                // Act & Assert - Should use interfaces internally
                expect(helper['configStorage']).toBeDefined();
                expect(helper['componentLoggers']).toBeDefined();
                expect(helper['workflowTrackers']).toBeDefined();
            });
        });

        describe('Component Configuration', () => {
            it('should configure components correctly', () => {
                // Arrange
                const helper = SentryHelper.getInstance();
                const componentName = 'TestComponent';

                // Act
                helper.configureComponent(componentName, {
                    logLevel: SentryLogLevel.DEBUG,
                    enableWorkflowTracking: true,
                    enablePerformanceTracking: false
                });

                // Assert
                const config = helper.getComponentConfig(componentName);
                expect(config?.logLevel).toBe(SentryLogLevel.DEBUG);
                expect(config?.enableWorkflowTracking).toBe(true);
                expect(config?.enablePerformanceTracking).toBe(false);
            });

            it('should handle multiple components', () => {
                // Arrange
                const helper = SentryHelper.getInstance();

                // Act
                helper.configureComponent('Component1', { logLevel: SentryLogLevel.INFO });
                helper.configureComponent('Component2', { logLevel: SentryLogLevel.ERROR });

                // Assert
                const config1 = helper.getComponentConfig('Component1');
                const config2 = helper.getComponentConfig('Component2');
                expect(config1?.logLevel).toBe(SentryLogLevel.INFO);
                expect(config2?.logLevel).toBe(SentryLogLevel.ERROR);
            });
        });

        describe('Logging', () => {
            it('should log messages correctly', () => {
                // Arrange
                const helper = SentryHelper.getInstance();
                const componentName = 'TestComponent';
                helper.configureComponent(componentName, { logLevel: SentryLogLevel.ALL });

                // Act & Assert - Should not throw
                expect(() => {
                    helper.logInfo(componentName, 'Test info message');
                    helper.logError(componentName, 'Test error message');
                    helper.logWarning(componentName, 'Test warning message');
                }).not.toThrow();
            });
        });

        describe('Workflow Tracking', () => {
            it('should track workflows correctly', () => {
                // Arrange
                const helper = SentryHelper.getInstance();
                const componentName = 'TestComponent';
                helper.configureComponent(componentName, { enableWorkflowTracking: true });

                // Act & Assert - Should not throw
                expect(() => {
                    helper.startWorkflow('test-workflow', 'Test Workflow', componentName);
                    helper.updateWorkflow('test-workflow', WorkflowState.IN_PROGRESS);
                    helper.completeWorkflow('test-workflow', true);
                }).not.toThrow();
            });
        });

        describe('Performance Tracking', () => {
            it('should track performance correctly', async () => {
                // Arrange
                const helper = SentryHelper.getInstance();
                const componentName = 'TestComponent';
                helper.configureComponent(componentName, { enablePerformanceTracking: true });
                const mockOperation = jest.fn().mockResolvedValue('test result');

                // Act
                const result = await helper.trackPerformance(componentName, 'test-operation', mockOperation);

                // Assert
                expect(result).toBe('test result');
                expect(mockOperation).toHaveBeenCalled();
            });
        });
    });

    describe('Integration Tests', () => {
        it('should work together seamlessly', () => {
            // Arrange
            const manager = SentryManager.getInstance();
            const helper = SentryHelper.getInstance();

            // Act & Assert - Should work together without conflicts
            expect(() => {
                manager.initialize({
                    dsn: 'test-dsn',
                    environment: 'test',
                    componentName: 'TestComponent'
                });

                helper.configureComponent('TestComponent', {
                    logLevel: SentryLogLevel.INFO,
                    enableWorkflowTracking: true
                });

                manager.logInfo('Manager message');
                helper.logInfo('TestComponent', 'Helper message');
            }).not.toThrow();
        });
    });
}); 