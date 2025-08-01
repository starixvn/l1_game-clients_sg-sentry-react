/** @format */

import "@testing-library/jest-dom";

// Mock sg-sentry for testing
jest.mock("sg-sentry", () => ({
  logTrace: jest.fn(),
  logDebug: jest.fn(),
  logInfo: jest.fn(),
  logWarning: jest.fn(),
  logError: jest.fn(),
  logFatal: jest.fn(),
  captureError: jest.fn(),
  startWorkflow: jest.fn(),
  updateWorkflow: jest.fn(),
  completeWorkflow: jest.fn(),
  trackPerformance: jest.fn(),
  configureComponent: jest.fn(),
  getComponentConfig: jest.fn(() => ({
    logLevel: "debug",
    enableWorkflowTracking: true,
    enablePerformanceTracking: true,
  })),
  getAllComponentNames: jest.fn(() => ["TestComponent"]),
  isComponentLoggingEnabled: jest.fn(() => true),
  configureSentry: jest.fn(),
  enableSentry: jest.fn(),
  disableSentry: jest.fn(),
  setSentryLogLevel: jest.fn(),
  isSentryEnabled: jest.fn(() => true),
  clearSentryConfig: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
