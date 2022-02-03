/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  // coverageProvider: "v8",
  testPathIgnorePatterns: ["/node_modules/", "lib"],
  setupFilesAfterEnv: ["./test/jest.setup.js"],
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.pc$": "jest-paperclip",
    "^.+\\.tsx?$": "babel-jest",
    "^.+\\.svg$": "jest-transform-stub",
  },
  transformIgnorePatterns: [],
};
