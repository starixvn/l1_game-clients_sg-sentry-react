'use client';

import { useEffect, useState } from 'react';
import { initializeSentry } from '@/configs/app-settings';

interface SentryProviderProps {
    children: React.ReactNode;
}

export function SentryProvider({ children }: SentryProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initSentry = async () => {
            try {
                console.log('[SentryProvider] Starting Sentry initialization...');
                await initializeSentry();
                setIsInitialized(true);
                console.log('[SentryProvider] Sentry initialized successfully');
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