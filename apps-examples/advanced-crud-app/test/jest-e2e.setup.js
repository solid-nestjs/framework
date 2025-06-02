// Jest setup file for e2e tests
require('reflect-metadata');

// Set longer timeout for e2e tests
jest.setTimeout(60000);

// Clean up after each test to prevent database locks
afterEach(async () => {
  // Add small delay to prevent database connection issues
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// Global error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
