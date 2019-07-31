"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-bcdk:pipeline", () => {
  beforeAll(() => {});

  it("main at root", () => {
    return helpers
      .run(path.join(__dirname, "../generators/pipeline"))
      .withPrompts({ name: "main" })
      .then(() => {
        assert.file([
          "Jenkinsfile",
          ".pipeline/.nvmrc",
          ".pipeline/build.js",
          ".pipeline/clean.js",
          ".pipeline/deploy.js",
          ".pipeline/lib/build.js",
          ".pipeline/lib/clean.js",
          ".pipeline/lib/config.js",
          ".pipeline/lib/deploy.js",
          ".pipeline/npmw",
          ".pipeline/package.json",
        ]);
      });
  });

  it("main at subfolder", () => {
    return helpers
      .run(path.join(__dirname, "../generators/pipeline"))
      .withPrompts({ name: "hello", path: "hello" })
      .then(() => {
        assert.file([
          "hello/Jenkinsfile",
          "hello/.pipeline/.nvmrc",
          "hello/.pipeline/build.js",
          "hello/.pipeline/clean.js",
          "hello/.pipeline/deploy.js",
          "hello/.pipeline/lib/build.js",
          "hello/.pipeline/lib/clean.js",
          "hello/.pipeline/lib/config.js",
          "hello/.pipeline/lib/deploy.js",
          "hello/.pipeline/npmw",
          "hello/.pipeline/package.json",
        ]);
      });
  });
});
