import { IStorage, IConfigStorage, SentryLogLevel, ComponentConfig } from '../types';

/**
 * LocalStorage implementation for browser environments
 */
export class LocalStorage implements IStorage {
  private storage: Storage;

  constructor(storage?: Storage) {
    this.storage = storage || (typeof window !== 'undefined' ? window.localStorage : new Map() as any);
  }

  // Public method to access the underlying storage for iteration
  getStorage(): Storage {
    return this.storage;
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item from storage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set item in storage:', error);
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item from storage:', error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }
}

/**
 * Configuration storage for Sentry settings
 */
export class SentryConfigStorage implements IConfigStorage {
  private storage: IStorage;
  private readonly PREFIX = 'sg-sentry:';
  private readonly ENABLED_KEY = `${this.PREFIX}enabled`;
  private readonly LOG_LEVEL_KEY = `${this.PREFIX}logLevel`;
  private readonly DEBUG_MODE_KEY = `${this.PREFIX}debugMode`;
  private readonly COMPONENT_PREFIX = `${this.PREFIX}component:`;

  constructor(storage?: IStorage) {
    this.storage = storage || new LocalStorage();
  }

  private getComponentKey(componentName: string, property: string): string {
    return `${this.COMPONENT_PREFIX}${componentName}:${property}`;
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
    return this.storage.getItem(this.getComponentKey(componentName, 'logLevel'));
  }

  setComponentLogLevel(componentName: string, level: string): void {
    this.storage.setItem(this.getComponentKey(componentName, 'logLevel'), level);
  }

  isComponentEnabled(componentName: string): boolean {
    const enabled = this.storage.getItem(this.getComponentKey(componentName, 'enabled'));
    return enabled === null ? true : enabled === 'true';
  }

  setComponentEnabled(componentName: string, enabled: boolean): void {
    this.storage.setItem(this.getComponentKey(componentName, 'enabled'), enabled.toString());
  }

  getComponentConfig(componentName: string): ComponentConfig | null {
    const configStr = this.storage.getItem(this.getComponentKey(componentName, 'config'));
    if (!configStr) return null;
    
    try {
      return JSON.parse(configStr);
    } catch (error) {
      console.warn('Failed to parse component config:', error);
      return null;
    }
  }

  setComponentConfig(componentName: string, config: ComponentConfig): void {
    try {
      this.storage.setItem(this.getComponentKey(componentName, 'config'), JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save component config:', error);
    }
  }

  clear(): void {
    // Clear all Sentry-related items
    const keys: string[] = [];
    
    if (this.storage instanceof LocalStorage && this.storage.getStorage() instanceof window.Storage) {
      const storage = this.storage.getStorage();
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          keys.push(key);
        }
      }
    }
    
    keys.forEach(key => this.storage.removeItem(key));
  }

  clearComponent(componentName: string): void {
    const keys = [
      this.getComponentKey(componentName, 'logLevel'),
      this.getComponentKey(componentName, 'enabled'),
      this.getComponentKey(componentName, 'config')
    ];
    
    keys.forEach(key => this.storage.removeItem(key));
  }

  getAllComponentNames(): string[] {
    const components = new Set<string>();
    
    if (this.storage instanceof LocalStorage && this.storage.getStorage() instanceof window.Storage) {
      const storage = this.storage.getStorage();
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.COMPONENT_PREFIX)) {
          const parts = key.replace(this.COMPONENT_PREFIX, '').split(':');
          if (parts.length >= 1) {
            components.add(parts[0]);
          }
        }
      }
    }
    
    return Array.from(components);
  }
} 