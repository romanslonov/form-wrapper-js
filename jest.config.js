module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  coverageDirectory: './coverage',
  setupFilesAfterEnv: ['jest-extended'],
  setupFiles: ['<rootDir>/tests/jest.setup.ts'],
}
