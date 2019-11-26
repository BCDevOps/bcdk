"use strict";
const options = require("@bcgov/pipeline-cli").Util.parseArguments();
const changeId = options.pr; //aka pull-request
const version = "1";
const name = "hello";

const phases = {
  build: {
    namespace: "xxtzwx-tools",
    name: `${name}`,
    phase: "build",
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: `build-${version}-${changeId}`,
  },
  dev: {
    namespace: `xxtzwx-dev`,
    name: `${name}`,
    phase: "dev",
    changeId: changeId,
    suffix: `-dev-${changeId}`,
    instance: `${name}-dev-${changeId}`,
    version: `${version}-${changeId}`,
    tag: `dev-${version}-${changeId}`,
  },
  test: {
    namespace: `xxtzwx-test`,
    name: `${name}`,
    phase: "test",
    changeId: changeId,
    suffix: `-test-${changeId}`,
    instance: `${name}-test-${changeId}`,
    version: `${version}-${changeId}`,
    tag: `test-${version}`,
  },
  prod: {
    namespace: `xxtzwx-prod`,
    name: `${name}`,
    phase: "prod",
    changeId: changeId,
    suffix: "",
    instance: `${name}-prod`,
    version: `${version}-${changeId}`,
    tag: `prod-${version}`,
  },
};

module.exports = exports = phases;
