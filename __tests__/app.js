"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");
jest.useFakeTimers();
describe("generator-bcdk:app", () => {
  it("creates files", () => {
    helpers
      .run(path.join(__dirname, "../generators/app"))
      .withPrompts({ someAnswer: true })
      .then(() => {
        assert.file(["dummyfile.txt"]);
      });
  });
});
