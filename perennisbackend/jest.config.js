export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.spec.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/resetDb.js"],
};
