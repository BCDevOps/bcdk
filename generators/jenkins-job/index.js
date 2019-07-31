/* eslint-disable capitalized-comments */
"use strict";
const Generator = require("../AbstractGenerator");
const uuidv4 = require("uuid/v4");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    // this.argument("name", { type: String, required: true });
    // this.option("module", { type: String, required: false, desc: "My option" });
    this.option("name", { type: String, required: false, desc: "My option" });
    this.option("jenkinsFilePath", {
      type: String,
      required: false,
      desc: "My option",
    });
    if (opts.module) {
      this.module = opts.module;
    }
  }

  async prompting() {
    if (!this.module) {
      if (!this.options.module) {
        await this.prompt([
          {
            type: "input",
            name: "module",
            message: "Module name?",
            default: ".",
          },
        ]).then(answers => {
          this.options.module = answers.module;
        });
      }
      this.module = this.answers.modules[this.options.module] || {};
      this.answers.modules[this.options.module] = this.module;
    }

    // eslint-disable-next-line no-negated-condition
    if (!this.options.name) {
      await this.prompt([
        {
          type: "input",
          name: "job",
          message: "Jenkins Job name?",
          default: this.module.jenkinsJobName || "",
        },
      ]).then(answers => {
        this.options.name = answers.job;
        this.answers.modules[this.options.module] = Object.assign(this.module, {
          jenkinsJobName: this.options.name,
        });
      });
    } else {
      Object.assign(this.module, {
        jenkinsJobName: this.options.name,
      });
    }

    await this.prompt([
      {
        type: "input",
        name: "github_owner",
        // eslint-disable-next-line prettier/prettier
        message: "What is the GitHub organization where the repository is located?",
        default: this.module.github_owner || "bcgov",
      },
      {
        type: "input",
        name: "github_repo",
        message: "What is the repository's name?",
        default: this.module.github_repo || "myrepo",
      },
      {
        type: "input",
        name: "jenkinsFilePath",
        message: "What is the Jenkinsfile path?",
        // eslint-disable-next-line prettier/prettier
        default: this.module.jenkinsFilePath || this.options.jenkinsFilePath || "Jenkinsfile"
      },
    ]).then(_props => {
      Object.assign(this.module, _props);
      if (!this.module.uuid) {
        this.module.uuid = uuidv4();
      }
    });
  }

  writing() {
    this.log("Writing 'jenkins-job' files.");
    var destinationConfigXml = this.destinationPath(
      `.jenkins/docker/contrib/jenkins/configuration/jobs/${this.module.jenkinsJobName}/config.xml`,
    );
    this.fs.copyTpl(this.templatePath("config.xml"), destinationConfigXml, this.module);
  }

  end() {
    this._savePrompts();
  }
};
