module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
};
