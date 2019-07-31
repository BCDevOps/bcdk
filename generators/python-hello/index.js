"use strict";
const Generator = require("../AbstractGenerator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.on("", () => {});
  }

  async prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the doozie ${chalk.red("generator-bcdk")} generator!`));

    await this.prompt([
      {
        type: "input",
        name: "name",
        message: "What module this component will belong to?",
        // eslint-disable-next-line prettier/prettier
        default: "main"
      },
    ]).then(answers => {
      this._module(answers.name);
    });

    await this.prompt([
      {
        type: "input",
        name: "path",
        message: "What module root path?",
        // eslint-disable-next-line prettier/prettier
        default: this.module.path || "."
      },
    ]).then(answers => {
      this.module.path = answers.path;
    });

    return this.prompt([
      {
        type: "input",
        name: "name",
        message: "What do you want to call this component?",
        default: "hello",
      },
    ]).then(answers => {
      this.component = this._component(answers.name);
    });
  }

  createPipeline() {
    this.composeWith(require.resolve("../pipeline"), {
      module: this.module,
      __answers: this.answers,
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath("main"),
      this.destinationPath(`${this.module.path}/${this.component.name}-main`),
    );
    this.fs.copy(
      this.templatePath("base"),
      this.destinationPath(`${this.module.path}/${this.component.name}-base`),
    );
    this.fs.copy(this.templatePath("openshift"), this.destinationPath(`openshift`));

    /*
    this.fs.copyTpl(
      this.templatePath("examples/config.js"),
      this.destinationPath(`.pipeline/examples/${this.props.name}/config.js`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("examples/build.js"),
      this.destinationPath(`.pipeline/examples/${this.props.name}/build.js`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("examples/deploy.js"),
      this.destinationPath(`.pipeline/examples/${this.props.name}/deploy.js`),
      this.props
    );
    */

    this._symLink(
      `${this.module.path}/${this.component.name}-main/requirements.txt`,
      `${this.module.path}/${this.component.name}-base/requirements.txt`,
    );
  }

  end() {
    // eslint-disable-next-line prettier/prettier
    this.log(`end - ${this.destinationPath(`${this.module.path}/${this.component.name}-main/requirements.txt`)}`);
    // eslint-disable-next-line prettier/prettier
    // this._createDirIfMissing(this.destinationPath(`${this.module.path}/${this.component.name}-main/requirements.txt`));
    // eslint-disable-next-line prettier/prettier
    // this._createDirIfMissing(this.destinationPath(`${this.module.path}/${this.component.name}-base/requirements.txt`));
    // eslint-disable-next-line prettier/prettier
    // this._createIfMissing(this.destinationPath(`${this.module.path}/${this.component.name}-main/requirements.txt`));

    this.log("Don't forget to update:");
    // eslint-disable-next-line prettier/prettier
    this.log(`1) '.pipeline/lib/config.js'. See '.pipeline/examples/${this.component.name}/config.js' for an example.`);
    // eslint-disable-next-line prettier/prettier
    this.log(`2) '.pipeline/lib/build.js'. See '.pipeline/examples/${this.component.name}/build.js' for an example.`);
    // eslint-disable-next-line prettier/prettier
    this.log(`3) '.pipeline/lib/deploy.js'. See '.pipeline/examples/${this.component.name}/deploy.js' for an example.`);
    this.log("");
  }
};
