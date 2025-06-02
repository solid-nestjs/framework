module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps-examples'],
  testMatch: ['**/test/**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          target: 'ES2021',
          module: 'CommonJS',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: false,
          skipLibCheck: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    'apps-examples/**/src/**/*.{ts,tsx}',
    '!apps-examples/**/src/**/*.d.ts',
    '!apps-examples/**/src/**/*.interface.ts',
  ],
  coverageDirectory: 'coverage-e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest-e2e.setup.js'],
  testTimeout: 60000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  maxWorkers: 1,
};
