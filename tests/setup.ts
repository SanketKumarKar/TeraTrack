import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for react-router-dom v7 in jsdom
global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;

// Node 18+ has native fetch. Ensure it is available in the jsdom environment.
// This is needed so Firebase Auth can import without errors.
if (typeof global.fetch === 'undefined' && typeof globalThis.fetch !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.fetch = globalThis.fetch as any;
}

// Mock matchMedia for recharts
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
