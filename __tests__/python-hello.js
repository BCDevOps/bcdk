"use strict";

const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-bcdk:python-hello", () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, "../generators/python-hello")).withPrompts({
      someAnswer: true,
    });
  });

  it("creates files", () => {
    assert.file(["hello-main/requirements.txt", "hello-base/requirements.txt"]);
  });
});
