import { logInfo, logError, logWarning, configureSentry } from 'sg-sentry';

import SG_LOCAL_CONFIG from './sg/configs.LOCAL_1.json';
import VG_LOCAL_CONFIG from './vg/configs.LOCAL_1.json';

// Site IDs constants
export const NOVA88_SITE_ID = 'NOVA88';
export const VIVA88_SITE_ID = 'VIVA88';

// Environment types
export enum APP_ENV {
    LOCAL = 'LOCAL',
    SIT = 'SIT',
    UAT = 'UAT',
    PROD = 'PROD'
}

// Configuration interface
export interface AppConfig {
    appEnv: APP_ENV;
    siteId: string;
}

// Sentry configuration interface
export interface SentryConfig {
    dsn: string;
    environment: string;
    logLevel: string;
    enableSessionReplay: boolean;
    sessionReplaySampleRate: number;
    errorSampleRate: number;
    componentLogging: {
        enabled: boolean;
        defaultLogLevel: string;
        components: Record<string, any>;
    };
}

// Main configuration interface
export interface EnvironmentConfig {
    sentry: SentryConfig;
    systemType: string;
    serverDomain: string;
    ssl: boolean;
    subDomain: string;
    env: string;
    enableMsgpackParserAllGames: boolean;
    enableMsgpackParserOnNotification: boolean;
    simulatorConfigs: {
        demoApiUrl: string;
        operatorId: string;
        operatorSecret: string;
        operatorToken: string;
    };
    defaultGameId: number;
    userServicePath: string;
    appType: number;
}

/**
 * Get environment configuration based on app environment and site ID
 */
export const getEnvironmentConfig = ({ appEnv, siteId }: AppConfig): EnvironmentConfig => {
    const componentName = 'AppSettings';

    try {
        logInfo(componentName, 'Loading environment configuration', {
            appEnv,
            siteId,
            timestamp: Date.now()
        });

        const configMaps = {
            [NOVA88_SITE_ID]: {
                LOCAL: VG_LOCAL_CONFIG,
                // Add other environments as needed
            },
            [VIVA88_SITE_ID]: {
                LOCAL: SG_LOCAL_CONFIG,
                // Add other environments as needed
            }
        };

        const environmentsConfig = configMaps[siteId]?.[appEnv];

        if (!environmentsConfig) {
            const error = `No environment configuration found for siteId: ${siteId}, appEnv: ${appEnv}`;
            logError(componentName, error, {
                siteId,
                appEnv,
                availableSites: Object.keys(configMaps),
                availableEnvs: Object.keys(configMaps[siteId] || {}),
                timestamp: Date.now()
            });
            throw new Error(error);
        }

        logInfo(componentName, 'Environment configuration loaded successfully', {
            appEnv,
            siteId,
            configKeys: Object.keys(environmentsConfig),
            timestamp: Date.now()
        });

        return environmentsConfig;
    } catch (error) {
        logError(componentName, 'Failed to load environment configuration', {
            error: error instanceof Error ? error.message : String(error),
            appEnv,
            siteId,
            timestamp: Date.now()
        });

        // Return a fallback configuration
        console.error('Failed to load environment configuration, using fallback:', error);
        return {
            sentry: {
                dsn: '',
                environment: 'development',
                logLevel: 'debug',
                enableSessionReplay: false,
                sessionReplaySampleRate: 0,
                errorSampleRate: 1,
                componentLogging: {
                    enabled: false,
                    defaultLogLevel: 'error',
                    components: {}
                }
            },
            systemType: 'development',
            serverDomain: 'localhost',
            ssl: false,
            subDomain: '',
            env: 'development',
            enableMsgpackParserAllGames: false,
            enableMsgpackParserOnNotification: false,
            simulatorConfigs: {
                demoApiUrl: '',
                operatorId: '',
                operatorSecret: '',
                operatorToken: ''
            },
            defaultGameId: 1,
            userServicePath: '/user',
            appType: 1
        };
    }
};

/**
 * Initialize app settings with default configuration
 */
export const appSettings = getEnvironmentConfig({
    appEnv: APP_ENV.LOCAL,
    siteId: VIVA88_SITE_ID
});

/**
 * Initialize Sentry with the loaded configuration
 */
export const initializeSentry = () => {
    const componentName = 'AppSettings';

    try {
        logInfo(componentName, 'Initializing Sentry configuration', {
            dsn: appSettings.sentry.dsn,
            environment: appSettings.sentry.environment,
            timestamp: Date.now()
        });

        configureSentry({
            dsn: appSettings.sentry.dsn,
            environment: appSettings.sentry.environment,
            logLevel: appSettings.sentry.logLevel,
            enableSessionReplay: appSettings.sentry.enableSessionReplay,
            sessionReplaySampleRate: appSettings.sentry.sessionReplaySampleRate,
            errorSampleRate: appSettings.sentry.errorSampleRate,
            componentLogging: appSettings.sentry.componentLogging
        });

        logInfo(componentName, 'Sentry configuration initialized successfully', {
            environment: appSettings.sentry.environment,
            timestamp: Date.now()
        });
    } catch (error) {
        logError(componentName, 'Failed to initialize Sentry configuration', {
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now()
        });
        console.warn('Failed to initialize Sentry configuration:', error);
    }
};

/**
 * Get component configuration for a specific component
 */
export const getComponentConfig = (componentName: string) => {
    const componentNameForLog = 'AppSettings';

    try {
        const componentConfig = appSettings.sentry.componentLogging.components[componentName];

        if (!componentConfig) {
            logWarning(componentNameForLog, `No configuration found for component: ${componentName}`, {
                componentName,
                availableComponents: Object.keys(appSettings.sentry.componentLogging.components),
                timestamp: Date.now()
            });

            return {
                logLevel: appSettings.sentry.componentLogging.defaultLogLevel,
                enableWorkflowTracking: false,
                enablePerformanceTracking: false
            };
        }

        logInfo(componentNameForLog, 'Component configuration retrieved successfully', {
            componentName,
            config: componentConfig,
            timestamp: Date.now()
        });

        return componentConfig;
    } catch (error) {
        logError(componentNameForLog, 'Failed to get component configuration', {
            error: error instanceof Error ? error.message : String(error),
            componentName,
            timestamp: Date.now()
        });

        return {
            logLevel: appSettings.sentry.componentLogging.defaultLogLevel,
            enableWorkflowTracking: false,
            enablePerformanceTracking: false
        };
    }
};

/**
 * Get all available component names
 */
export const getAllComponentNames = () => {
    return Object.keys(appSettings.sentry.componentLogging.components);
};

/**
 * Check if component logging is enabled
 */
export const isComponentLoggingEnabled = () => {
    return appSettings.sentry.componentLogging.enabled;
};

/**
 * Get system configuration
 */
export const getSystemConfig = () => {
    return {
        systemType: appSettings.systemType,
        serverDomain: appSettings.serverDomain,
        ssl: appSettings.ssl,
        subDomain: appSettings.subDomain,
        env: appSettings.env,
        appType: appSettings.appType
    };
};

/**
 * Get simulator configuration
 */
export const getSimulatorConfig = () => {
    return appSettings.simulatorConfigs;
}; 