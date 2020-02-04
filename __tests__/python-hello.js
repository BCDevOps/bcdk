"use strict";

const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");
jest.useFakeTimers();
describe("generator-bcdk:python-hello", () => {
  it("creates files", () => {
    helpers
      .run(path.join(__dirname, "../generators/python-hello"))
      .withPrompts({
        someAnswer: true,
      })
      .then(() => {
        assert.file(["hello-main/requirements.txt", "hello-base/requirements.txt"]);
      });
  });
});
