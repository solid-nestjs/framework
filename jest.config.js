module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages-core'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
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
    'packages-core/**/src/**/*.{ts,tsx}',
    '!packages-core/**/src/**/*.d.ts',
    '!packages-core/**/src/**/*.interface.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@solid-nestjs/common(.*)$': '<rootDir>/packages-core/common/src$1',
    '^@solid-nestjs/rest-api(.*)$': '<rootDir>/packages-core/rest-api/src$1',
    '^@solid-nestjs/graphql(.*)$': '<rootDir>/packages-core/graphql/src$1',
    '^@solid-nestjs/typeorm(.*)$': '<rootDir>/packages-core/typeorm/src$1',
    '^@solid-nestjs/rest-graphql(.*)$':
      '<rootDir>/packages-core/rest-graphql/src$1',
  },
  testTimeout: 30000,
  verbose: true,
};
