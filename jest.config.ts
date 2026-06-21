import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  // Exclude Playwright e2e tests — they must run with `npm run test:e2e`
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  collectCoverage: true,
  // Only collect coverage from pure business-logic files (not Firebase-dependent pages)
  collectCoverageFrom: ['src/lib/calculator.ts', 'src/lib/constants.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  // Mock Firebase modules to avoid import-time fetch/network errors in jsdom
  moduleNameMapper: {
    '^firebase/app$': '<rootDir>/tests/__mocks__/firebase-app.ts',
    '^firebase/auth$': '<rootDir>/tests/__mocks__/firebase-auth.ts',
    '^firebase/firestore$': '<rootDir>/tests/__mocks__/firebase-firestore.ts',
  },
};

export default config;
