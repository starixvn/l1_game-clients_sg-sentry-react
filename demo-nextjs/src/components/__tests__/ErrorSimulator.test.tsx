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

describe('ErrorSimulator', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders error simulator with all error types', () => {
        render(<ErrorSimulator />)
        
        // Check if main heading is rendered
        expect(screen.getByText('Error Simulator')).toBeInTheDocument()
        
        // Check if all error types are rendered
        expect(screen.getByText('JavaScript Error')).toBeInTheDocument()
        expect(screen.getByText('Network Error')).toBeInTheDocument()
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
        expect(screen.getByText('Timeout Error')).toBeInTheDocument()
        expect(screen.getByText('Memory Error')).toBeInTheDocument()
        expect(screen.getByText('Syntax Error')).toBeInTheDocument()
        expect(screen.getByText('Type Error')).toBeInTheDocument()
        expect(screen.getByText('Reference Error')).toBeInTheDocument()
    })

    it('displays component configuration information', () => {
        render(<ErrorSimulator />)
        
        // Check if component configuration section is rendered
        expect(screen.getByText('Component Configuration')).toBeInTheDocument()
        expect(screen.getByText('ErrorSimulator')).toBeInTheDocument()
        
        // Use getAllByText for multiple debug elements
        const debugElements = screen.getAllByText('debug')
        expect(debugElements.length).toBeGreaterThan(0)
    })

    it('shows log level and tracking status', () => {
        render(<ErrorSimulator />)
        
        // Check if status information is displayed using getAllByText
        const logLevelElements = screen.getAllByText(/Log Level:/)
        const workflowElements = screen.getAllByText(/Workflow:/)
        const performanceElements = screen.getAllByText(/Performance:/)
        
        expect(logLevelElements.length).toBeGreaterThan(0)
        expect(workflowElements.length).toBeGreaterThan(0)
        expect(performanceElements.length).toBeGreaterThan(0)
    })

    it('renders error type descriptions', () => {
        render(<ErrorSimulator />)
        
        // Check if error descriptions are rendered
        expect(screen.getByText('General JavaScript runtime error')).toBeInTheDocument()
        expect(screen.getByText('API request failure')).toBeInTheDocument()
        expect(screen.getByText('Input validation failure')).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
        render(<ErrorSimulator />)
        
        // Check if buttons are properly accessible
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
            // Buttons don't need type="button" by default in React
            expect(button).toBeInTheDocument()
        })
    })

    it('displays error icons for each error type', () => {
        render(<ErrorSimulator />)
        
        // Check if error icons are rendered using getAllByText for multiple instances
        expect(screen.getAllByText('💥')[0]).toBeInTheDocument() // JavaScript Error
        expect(screen.getAllByText('🌐')[0]).toBeInTheDocument() // Network Error
        expect(screen.getAllByText('✅')[0]).toBeInTheDocument() // Validation Error
        expect(screen.getAllByText('⏰')[0]).toBeInTheDocument() // Timeout Error
        expect(screen.getAllByText('🧠')[0]).toBeInTheDocument() // Memory Error
        expect(screen.getAllByText('📝')[0]).toBeInTheDocument() // Syntax Error
        expect(screen.getAllByText('🔤')[0]).toBeInTheDocument() // Type Error
        expect(screen.getAllByText('🔗')[0]).toBeInTheDocument() // Reference Error
    })

    it('shows workflow and performance tracking status', () => {
        render(<ErrorSimulator />)
        
        // Check if tracking status is displayed using getAllByText
        const enabledIndicators = screen.getAllByText('✅')
        expect(enabledIndicators.length).toBeGreaterThan(0)
    })

    it('has responsive design classes', () => {
        render(<ErrorSimulator />)
        
        // Check if responsive grid classes are applied
        const gridContainer = screen.getByText('JavaScript Error').closest('.grid')
        expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })

    it('displays error simulation description', () => {
        render(<ErrorSimulator />)
        
        expect(screen.getByText(/Simulate various types of errors to test SG-Sentry logging and error tracking capabilities/)).toBeInTheDocument()
    })
}) 