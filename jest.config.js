module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(\\.|/)(test|spec)\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    "globals": {
      "ts-jest": {
        "tsconfig": "src/tsconfig.json"
      }
    },
  }
  