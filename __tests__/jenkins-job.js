"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");
jest.mock("fs");
jest.useFakeTimers();
describe("generator-bcdk:jenkins-job", () => {
  beforeEach(() => {
    require("fs").__setMockFiles([".git/objects/foo.txt"]);
  });

  it("creates files", async () => {
    helpers
      .run(path.join(__dirname, "../generators/jenkins-job"))
      .withPrompts({ someAnswer: true })
      .then(() => {
        assert.file(["dummyfile.txt"]);
      });
  });
});
