// Mock localStorage for tests
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

export { };

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock Sentry global
Object.defineProperty(globalThis, 'Sentry', {
    value: {
        init: jest.fn(),
        setTag: jest.fn(),
        setExtra: jest.fn(),
        captureMessage: jest.fn(),
        captureException: jest.fn(),
    },
    writable: true,
});

// Mock console methods
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
}; 