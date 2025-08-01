import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigurationPanel } from '../ConfigurationPanel'

// Mock the app-settings module
jest.mock('@/configs/app-settings', () => ({
    getComponentConfig: jest.fn(() => ({
        logLevel: 'debug',
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    })),
    getAllComponentNames: jest.fn(() => ['TestComponent', 'AnotherComponent']),
    getSystemConfig: jest.fn(() => ({
        systemType: 'SG',
        serverDomain: 'localhost',
        ssl: false,
        env: 'LOCAL1'
    })),
    getSimulatorConfig: jest.fn(() => ({
        demoApiUrl: 'http://localhost:3001',
        operatorId: 'TEST_OPERATOR'
    }))
}))

// Mock sg-sentry
jest.mock('sg-sentry', () => ({
    configureComponent: jest.fn(),
    getComponentConfig: jest.fn(() => ({
        logLevel: 'debug',
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    })),
    getAllComponentNames: jest.fn(() => ['TestComponent', 'AnotherComponent'])
}))

describe('ConfigurationPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders configuration panel with component selection', async () => {
        render(<ConfigurationPanel />)
        
        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        // Check if main heading is rendered
        expect(screen.getByText('Configuration Panel')).toBeInTheDocument()
        
        // Check if component selection is rendered
        const componentConfigElements = screen.getAllByText('Component Configuration')
        expect(componentConfigElements.length).toBeGreaterThan(0)
        expect(screen.getByText('Select Component')).toBeInTheDocument()
    })

    it('displays component configuration information', async () => {
        render(<ConfigurationPanel />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        // Check if component configuration section is rendered
        const componentConfigElements = screen.getAllByText('Component Configuration')
        expect(componentConfigElements.length).toBeGreaterThan(0)
        expect(screen.getByText('ConfigurationPanel')).toBeInTheDocument()
        
        // Use getAllByText for multiple debug elements
        const debugElements = screen.getAllByText('debug')
        expect(debugElements.length).toBeGreaterThan(0)
    })

    it('shows log level and tracking status', async () => {
        render(<ConfigurationPanel />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        // Check if status information is displayed using getAllByText
        const logLevelElements = screen.getAllByText(/Log Level:/)
        const workflowElements = screen.getAllByText(/Workflow:/)
        const performanceElements = screen.getAllByText(/Performance:/)
        
        expect(logLevelElements.length).toBeGreaterThan(0)
        expect(workflowElements.length).toBeGreaterThan(0)
        expect(performanceElements.length).toBeGreaterThan(0)
    })

    it('displays system configuration', async () => {
        render(<ConfigurationPanel />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        // Check if system configuration is displayed
        expect(screen.getByText('System Configuration')).toBeInTheDocument()
        expect(screen.getByText('systemType')).toBeInTheDocument()
        expect(screen.getByText('serverDomain')).toBeInTheDocument()
    })

    it('displays simulator configuration', async () => {
        render(<ConfigurationPanel />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        // Check if simulator configuration is displayed
        expect(screen.getByText('Simulator Configuration')).toBeInTheDocument()
        expect(screen.getByText('demoApiUrl')).toBeInTheDocument()
        expect(screen.getByText('operatorId')).toBeInTheDocument()
    })

    it('handles component selection', async () => {
        render(<ConfigurationPanel />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        // Check if component selection dropdown is rendered
        const select = screen.getByDisplayValue('TestComponent')
        expect(select).toBeInTheDocument()
    })

    it('shows workflow and performance tracking status', async () => {
        render(<ConfigurationPanel />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        // Check if tracking status is displayed using getAllByText
        const enabledIndicators = screen.getAllByText('✅')
        expect(enabledIndicators.length).toBeGreaterThan(0)
    })

    it('displays configuration panel description', async () => {
        render(<ConfigurationPanel />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading configurations...')).not.toBeInTheDocument()
        })
        
        expect(screen.getByText(/View and modify Sentry configuration for individual components/)).toBeInTheDocument()
    })
}) 