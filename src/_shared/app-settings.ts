// App settings for Sentry configuration
export interface AppSettings {
    sentryDsn: string;
    sentryEnvironment: string;
    sentryRelease?: string;
}

// Default app settings with Sentry configuration
export const appSettingsWithSentry: AppSettings = {
    sentryDsn: process.env.SENTRY_DSN || 'https://25edcde4c336c7086e5ae4f5e565a672@o4509749941305344.ingest.us.sentry.io/4509749948973056',
    sentryEnvironment: process.env.NODE_ENV || 'development',
    sentryRelease: process.env.SENTRY_RELEASE || '1.0.0'
}; 