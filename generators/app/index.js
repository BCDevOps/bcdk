"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the striking ${chalk.red("generator-bcdk")} generator!`));

    const prompts = [
      {
        type: "confirm",
        name: "someAnswer",
        message: "Would you like to enable this option?",
        default: true,
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    // eslint-disable-next-line no-console
    console.log(`path: ${this.destinationPath("dummyfile.txt")}`);
    this.fs.copy(this.templatePath("dummyfile.txt"), this.destinationPath("dummyfile.txt"));
  }

  install() {
    this.installDependencies();
  }
};
