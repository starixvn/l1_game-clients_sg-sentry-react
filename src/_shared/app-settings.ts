// App settings for Sentry configuration
export interface AppSettings {
  sentryDsn: string;
  sentryEnvironment: string;
  sentryRelease?: string;
}

// Default app settings with Sentry configuration
export const appSettingsWithSentry: AppSettings = {
  sentryDsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@your-org.ingest.sentry.io/your-project',
  sentryEnvironment: process.env.NODE_ENV || 'development',
  sentryRelease: process.env.SENTRY_RELEASE || '1.0.0'
}; 