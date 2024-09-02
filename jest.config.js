module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  setupFiles: ['dotenv/config'],
  testTimeout: 15000,
  moduleDirectories: ['node_modules', 'src'],
};
