module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/backend/tests/setup.js'],
  testTimeout: 20000,
  testPathIgnorePatterns: ['/node_modules/', '/Frontend/']
};