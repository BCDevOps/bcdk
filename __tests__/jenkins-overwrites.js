"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

jest.mock("fs");
jest.useFakeTimers();

describe("generator-bcdk:jenkins-overwrites", () => {
  beforeEach(() => {
    require("fs").__setMockFiles([".git/objects/foo.txt"]);
  });

  it("creates files", () => {
    helpers
      .run(path.join(__dirname, "../generators/jenkins-overwrites"))
      .withPrompts({ someAnswer: true })
      .then(() => {
        assert.file(["dummyfile.txt"]);
      });
  });
});
