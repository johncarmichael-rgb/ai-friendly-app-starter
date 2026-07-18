const ignore = [
  '/.openapi-nodegen/',
  '/node_modules/',
  '/build/',
  '/dist/',
  // Vendored seed apps carry their own vitest suites — not ours to run.
  '/seed-apps/',
];

module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'ts',
    'tsx',
  ],
  // Cap parallelism so a local run never saturates every core. Each ts-jest
  // worker does full project type-checking + coverage, so workers are heavy;
  // keep this low. CI can override with `--maxWorkers` on the command line.
  maxWorkers: '25%',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/domains/*.{js,ts}',
    'src/services/*.{js,ts}',
    'src/utils/*.{js,ts}',
  ],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  transformIgnorePatterns: ignore,
  testPathIgnorePatterns: ignore,
  modulePathIgnorePatterns: ignore,
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: [
    './jest.setup.js',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
};
