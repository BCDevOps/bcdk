"use strict";

const Generator = require("../AbstractGenerator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option("path", { type: String, required: false, desc: "Module Path" });
  }

  writing() {
    this.log(`Writing 'jenkins-overwrites' files.`);
    this.fs.copy(
      this.templatePath(".jenkins/.pipeline/lib"),
      this.destinationPath(`${this.options.path}/.pipeline/lib`),
    );
    this.fs.copy(
      this.templatePath(".jenkins/Jenkinsfile"),
      this.destinationPath(`${this.options.path}/Jenkinsfile`),
    );
  }

  end() {
    this._savePrompts();
  }
};
