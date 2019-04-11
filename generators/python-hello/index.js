"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the doozie ${chalk.red("generator-bcdk")} generator!`)
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What do you want to call this component?',
        default: 'hello'
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath("main"),
      this.destinationPath(`${this.props.name}-main`)
    );
    this.fs.copy(
      this.templatePath("base"),
      this.destinationPath(`${this.props.name}-base`)
    );

    this.fs.copy(
      this.templatePath("openshift"),
      this.destinationPath(`openshift`)
    );

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
  }

  end() {
    this.log("Don't forget to update:");
    // eslint-disable-next-line prettier/prettier
    this.log(`1) '.pipeline/lib/config.js'. See '.pipeline/examples/${this.props.name}/config.js' for an example.`);
    // eslint-disable-next-line prettier/prettier
    this.log(`2) '.pipeline/lib/build.js'. See '.pipeline/examples/${this.props.name}/build.js' for an example.`);
    // eslint-disable-next-line prettier/prettier
    this.log(`3) '.pipeline/lib/deploy.js'. See '.pipeline/examples/${this.props.name}/deploy.js' for an example.`);
    this.log("");
  }
};
