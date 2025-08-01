import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    componentName?: string;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class SGSentryDevErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log the error
        console.error('SGSentryDevErrorBoundary caught an error:', {
            error,
            errorInfo,
            componentName: this.props.componentName
        });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    padding: '20px',
                    border: '1px solid #ff6b6b',
                    borderRadius: '4px',
                    backgroundColor: '#fff5f5',
                    color: '#d63031'
                }}>
                    <h3>Something went wrong</h3>
                    {this.props.componentName && (
                        <p>Component: {this.props.componentName}</p>
                    )}
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>Error Details</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
} 