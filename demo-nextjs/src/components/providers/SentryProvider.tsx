'use client';

import { useEffect } from 'react';
import { initializeSentry } from '@/configs/app-settings';
import { logInfo } from 'sg-sentry';

interface SentryProviderProps {
    children: React.ReactNode;
}

export function SentryProvider({ children }: SentryProviderProps) {
    useEffect(() => {
        const componentName = 'SentryProvider';

        try {
            logInfo(componentName, 'Initializing Sentry in provider', {
                timestamp: Date.now()
            });

            // Initialize Sentry with configuration
            initializeSentry();

            logInfo(componentName, 'Sentry provider initialization completed', {
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to initialize Sentry in provider:', error);
        }
    }, []);

    return <>{children}</>;
} 