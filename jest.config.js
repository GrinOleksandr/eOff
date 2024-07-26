export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  transform: {},
  setupFiles: ['dotenv/config'],
  testTimeout: 15000,
  moduleDirectories: ['node_modules', 'src'],
};
