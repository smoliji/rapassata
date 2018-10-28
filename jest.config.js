module.exports = {
    "roots": [
      "<rootDir>/src"
    ],
    "reporters": ["default", "jest-junit"],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/test/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
      "ts",
      "js",
      "json",
      "node"
    ],
  }