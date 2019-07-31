"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-bcdk:jenkins-overwrites", () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, "../generators/jenkins-overwrites"))
      .withPrompts({ someAnswer: true });
  });

  it("creates files", () => {
    assert.file(["dummyfile.txt"]);
  });
});
