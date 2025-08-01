'use client';

import { useEffect, useState } from 'react';
import { initializeSentry } from '@/configs/app-settings';

interface SentryProviderProps {
    children: React.ReactNode;
}

// Load Sentry SDK from CDN
const loadSentrySDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if Sentry is already loaded
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            console.log('[SentryProvider] Sentry SDK already loaded');
            resolve();
            return;
        }

        // Load Sentry SDK from CDN
        const script = document.createElement('script');
        script.src = 'https://browser.sentry-cdn.com/7.88.0/bundle.min.js';
        script.integrity = 'sha384-97phG3Cb0Vm+2N88y9hJ7CExwrkO9B9FvxZ5Oq3hQGfFSK/BrojizIIReHJ1J8yS';
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
            console.log('[SentryProvider] Sentry SDK loaded successfully');
            resolve();
        };
        
        script.onerror = () => {
            console.error('[SentryProvider] Failed to load Sentry SDK');
            reject(new Error('Failed to load Sentry SDK'));
        };
        
        document.head.appendChild(script);
    });
};

// Initialize Sentry SDK
const initializeSentrySDK = (dsn: string, environment: string): void => {
    if (typeof window === 'undefined' || !(window as any).Sentry) {
        console.warn('[SentryProvider] Sentry SDK not available');
        return;
    }

    const Sentry = (window as any).Sentry;
    
    // Check if already initialized
    if (Sentry.getCurrentHub().getClient()) {
        console.log('[SentryProvider] Sentry SDK already initialized');
        return;
    }

    try {
        Sentry.init({
            dsn: dsn,
            environment: environment,
            release: '1.0.0',
            debug: true,
            tracesSampleRate: 1.0,
            replaysSessionSampleRate: 1.0,
            replaysOnErrorSampleRate: 1.0
        });
        console.log('[SentryProvider] Sentry SDK initialized successfully');
    } catch (error) {
        console.error('[SentryProvider] Failed to initialize Sentry SDK:', error);
        throw error;
    }
};

export function SentryProvider({ children }: SentryProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initSentry = async () => {
            try {
                console.log('[SentryProvider] Starting Sentry initialization...');
                
                // Step 1: Load Sentry SDK from CDN
                await loadSentrySDK();
                
                // Step 2: Initialize Sentry SDK with configuration
                // We'll get the DSN from the app settings
                const { appSettings } = await import('@/configs/app-settings');
                initializeSentrySDK(
                    appSettings.sentry.dsn,
                    appSettings.sentry.environment
                );
                
                // Step 3: Initialize sg-sentry configuration
                await initializeSentry();
                
                setIsInitialized(true);
                console.log('[SentryProvider] Sentry initialization completed successfully');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error during Sentry initialization';
                console.error('[SentryProvider] Failed to initialize Sentry:', errorMessage);
                setError(errorMessage);
                // Still set as initialized to prevent blocking the app
                setIsInitialized(true);
            }
        };

        initSentry();
    }, []);

    // Show loading state while initializing
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing Sentry...</p>
                </div>
            </div>
        );
    }

    // Show error state if initialization failed
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Sentry Initialization Failed</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <p className="text-sm text-red-500">
                        The application will continue to work, but error tracking may be limited.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 