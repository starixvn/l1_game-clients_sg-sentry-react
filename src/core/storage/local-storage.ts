import { IStorage, IConfigStorage } from '../interfaces';
import { SentryLogLevel } from '../sentry-types';

// Default storage implementation using localStorage
export class LocalStorage implements IStorage {
    getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('Failed to get item from localStorage:', error);
            return null;
        }
    }

    setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('Failed to set item in localStorage:', error);
        }
    }

    removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove item from localStorage:', error);
        }
    }

    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }
}

// Configuration storage implementation
export class SentryConfigStorage implements IConfigStorage {
    private storage: IStorage;
    private readonly PREFIX = 'sg-sentry-';
    private readonly ENABLED_KEY = `${this.PREFIX}enabled`;
    private readonly LOG_LEVEL_KEY = `${this.PREFIX}log-level`;
    private readonly DEBUG_MODE_KEY = `${this.PREFIX}debug-mode`;
    private readonly COMPONENT_PREFIX = `${this.PREFIX}component-`;

    constructor(storage?: IStorage) {
        this.storage = storage || new LocalStorage();
    }

    getLogLevel(): string {
        return this.storage.getItem(this.LOG_LEVEL_KEY) || SentryLogLevel.INFO;
    }

    setLogLevel(level: string): void {
        this.storage.setItem(this.LOG_LEVEL_KEY, level);
    }

    isEnabled(): boolean {
        const enabled = this.storage.getItem(this.ENABLED_KEY);
        return enabled === null ? true : enabled === 'true';
    }

    setEnabled(enabled: boolean): void {
        this.storage.setItem(this.ENABLED_KEY, enabled.toString());
    }

    isDebugMode(): boolean {
        const debugMode = this.storage.getItem(this.DEBUG_MODE_KEY);
        return debugMode === 'true';
    }

    setDebugMode(debugMode: boolean): void {
        this.storage.setItem(this.DEBUG_MODE_KEY, debugMode.toString());
    }

    getComponentLogLevel(componentName: string): string | null {
        return this.storage.getItem(`${this.COMPONENT_PREFIX}${componentName}-log-level`);
    }

    setComponentLogLevel(componentName: string, level: string): void {
        this.storage.setItem(`${this.COMPONENT_PREFIX}${componentName}-log-level`, level);
    }

    isComponentEnabled(componentName: string): boolean {
        const enabled = this.storage.getItem(`${this.COMPONENT_PREFIX}${componentName}-enabled`);
        return enabled === null ? true : enabled === 'true';
    }

    setComponentEnabled(componentName: string, enabled: boolean): void {
        this.storage.setItem(`${this.COMPONENT_PREFIX}${componentName}-enabled`, enabled.toString());
    }

    clear(): void {
        // Clear all sg-sentry related items
        const keys: string[] = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.PREFIX)) {
                    keys.push(key);
                }
            }
        } catch (error) {
            console.warn('Failed to iterate localStorage:', error);
        }

        keys.forEach(key => this.storage.removeItem(key));
    }

    clearComponent(componentName: string): void {
        this.storage.removeItem(`${this.COMPONENT_PREFIX}${componentName}-log-level`);
        this.storage.removeItem(`${this.COMPONENT_PREFIX}${componentName}-enabled`);
    }
} 