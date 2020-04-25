module.exports = {
  "testEnvironment": "node",
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "globals": {
    "ts-jest": {
      "babelConfig": true
    }
  },
  "transformIgnorePatterns": [
    "/node_modules/"
  ],
  "testMatch": [
    "**/tests/*.test.(js|ts)"
  ],
  "testURL": "http://localhost/",
  "collectCoverage": true,
  "coveragePathIgnorePatterns": [
    "/node_modules/"
  ],
  "collectCoverageFrom": [
    "src/*.{ts,js}"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 5,
      "functions": 5,
      "lines": 5,
      "statements": 5
    }
  }
}
