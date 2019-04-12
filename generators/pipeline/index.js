"use strict";

const Generator = require("../AbstractGenerator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option("module", { type: String, required: false, desc: "My option" });
    this.option("environments", {
      type: String,
      required: false,
      // eslint-disable-next-line prettier/prettier
      desc: "Environment names (E.g. build, dev, test, prod) separated by space."
    });
  }

  async prompting() {
    if (!this.options.module) {
      await this.prompt([
        {
          type: "input",
          name: "module",
          // eslint-disable-next-line prettier/prettier
          message: "What is this module id/key?",
          default: "hello"
        }
      ]).then(answers => {
        this.options.module = answers.module;
      });
    }

    this.module = this.answers.modules[this.options.module] || {};
    this.answers.modules[this.options.module] = this.module;

    await this.prompt([
      {
        type: "input",
        name: "name",
        // eslint-disable-next-line prettier/prettier
        message: "What is this module name?",
        default: this.module.name || this.options.name
      },{
        type: "input",
        name: "version",
        // eslint-disable-next-line prettier/prettier
        message: "What is this module version?",
        default: this.module.version || this.options.version || "1.0.0"
      }
    ]).then(answers => {
      this.module.name = answers.name;
      this.module.version = answers.version;
    });

    if (!this.options.environments) {
      let defaultEnvironments = "build dev test prod";
      if (this.module.environments) {
        defaultEnvironments = Object.keys(this.module.environments).join(" ");
      }
      await this.prompt([
        {
          type: "input",
          name: "environments",
          // eslint-disable-next-line prettier/prettier
          message: "What environments are supported by your app? separated by space",
          default: defaultEnvironments
        }
      ]).then(answers => {
        this.options.environments = answers.environments;
      });
    }

    const environments = {};
    // eslint-disable-next-line prettier/prettier
    this.options.environments.trim().split(" ")
      .forEach(item => {
        environments[item] = (this.module.environments) ? this.module.environments[item] : {}  
      });
    this.module.environments = environments;

    const prompts = [];
    Object.keys(environments).forEach(item => {
      prompts.push({
        type: "input",
        name: `${item.trim()}`,
        message: `What namespace/project name is used for '${item.trim()}?'`,
        // eslint-disable-next-line prettier/prettier
        default: (environments[item.trim()] || {}).namespace || this.module.namespace || ""
      });
    });
    console.log(environments);
    await this.prompt(prompts).then(answers => {
      Object.keys(answers).forEach(item => {
        environments[item].namespace = answers[item];
      });
    });
  }

  writing() {
    this.log("Writing 'pipeline' files.");
    this.fs.copyTpl(
      this.templatePath(`.pipeline`),
      this.destinationPath(`${this.options.module}/.pipeline`),
      this.module
    );
    this.fs.copy(
      this.templatePath(`Jenkinsfile`),
      this.destinationPath(`${this.options.module}/Jenkinsfile`)
    );
  }

  end() {
    this._savePrompts();
  }
};
