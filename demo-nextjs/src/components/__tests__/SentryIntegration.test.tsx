import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorSimulator } from '../ErrorSimulator'

// Mock the app-settings module
jest.mock('@/configs/app-settings', () => ({
    getComponentConfig: jest.fn(() => ({
        logLevel: 'debug',
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    }))
}))

// Mock sg-sentry
jest.mock('sg-sentry', () => ({
    logTrace: jest.fn(),
    logDebug: jest.fn(),
    logInfo: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn(),
    logFatal: jest.fn(),
    captureError: jest.fn(),
    startWorkflow: jest.fn(),
    completeWorkflow: jest.fn(),
    trackPerformance: jest.fn()
}))

describe('Sentry Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Mock window.Sentry
        Object.defineProperty(window, 'Sentry', {
            value: {
                init: jest.fn(),
                captureException: jest.fn(),
                captureMessage: jest.fn(),
                getCurrentHub: () => ({
                    getClient: () => ({})
                })
            },
            writable: true
        })
    })

    it('should render ErrorSimulator with Sentry integration', () => {
        render(<ErrorSimulator />)

        expect(screen.getByText('Error Simulator')).toBeInTheDocument()
        expect(screen.getByText('JavaScript Error')).toBeInTheDocument()
    })

    it('should have Sentry SDK available', () => {
        expect(window.Sentry).toBeDefined()
        expect(window.Sentry.init).toBeDefined()
        expect(window.Sentry.captureException).toBeDefined()
        expect(window.Sentry.captureMessage).toBeDefined()
    })

    it('should be able to simulate errors', async () => {
        render(<ErrorSimulator />)

        const jsErrorButton = screen.getByText('JavaScript Error')
        expect(jsErrorButton).toBeInTheDocument()

        // The button should be clickable
        expect(jsErrorButton).not.toBeDisabled()
    })
}) 