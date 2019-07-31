"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-bcdk:app", () => {
  beforeAll(() => {
    const ctx = helpers
      .run(path.join(__dirname, "../generators/app"))
      .withPrompts({ someAnswer: true });
    return ctx;
  });

  it("creates files", () => {
    assert.file(["dummyfile.txt"]);
  });
});
