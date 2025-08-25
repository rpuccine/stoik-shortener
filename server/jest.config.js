module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleFileExtensions: ['ts','js','json'],
  transform: {
    '^.+\\.(ts)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  }
};
