module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'index.js',
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'config/**/*.js',
  ],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  moduleFileExtensions: ['js'],
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
