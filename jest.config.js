/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',   // Use Node.js as the test environment (not browser)
  transform: {
    '^.+\\.ts$': 'ts-jest',  // Transform .ts files using ts-jest
  },
  moduleFileExtensions: ['ts', 'js', 'json'],  // Recognize .ts, .js, .json files
  testMatch: ['**/*.test.ts'],  // Define where Jest should look for tests
  globals: {
    'ts-jest': {
      isolatedModules: true,  // Optimize for performance (disable type checking)
    },
  },
};