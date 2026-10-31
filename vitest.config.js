const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    fileParallelism: false,
    sequence: {
      concurrent: false
    },
    testTimeout: 15000
  }
});
