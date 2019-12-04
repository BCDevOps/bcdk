/* eslint-disable capitalized-comments */
"use strict";
const Generator = require("../AbstractGenerator");
const chalk = require("chalk");
const { spawnSync } = require("child_process");
const moduleId = "sonarqube";

module.exports = class extends Generator {
  async prompting() {
    this.module = this.answers.modules[moduleId] || {};
    this.answers.modules[moduleId] = this.module;
    this.module.path = ".sonarqube";
    this.module.name = this.module.name || "sonarqube";

    await this.prompt([
      {
        type: "input",
        name: "namespace",
        message: "What is your openshift 'tools' namespace name?",
        // eslint-disable-next-line prettier/prettier
        default: this.module.namespace || ""
      },
    ])
      .then(answers => {
        const canICreateRoleBinding = spawnSync(
          "oc",
          ["-n", answers.namespace, "auth", "can-i", "create", "rolebinding"],
          { encoding: "utf-8" },
        );

        if (canICreateRoleBinding.status !== 0) {
          this.env.error(
            `It seems like you do not have admin privilege in the project '${chalk.red(
              answers.namespace,
            )}'. Please check that the namespace is correct.\nTry running the following command:\n${canICreateRoleBinding.args &&
              canICreateRoleBinding.args.join(" ")}`,
          );
        }
        return answers;
      })
      .then(answers => {
        this.module.namespace = answers.namespace;
      });

    await this._promptModuleName();

    spawnSync(
      "oc",
      [
        "-n",
        this.module.namespace,
        "new-app",
        "-f",
        `${this.templatePath(".sonarqube")}/openshift/sonarqube-postgresql-template.yaml`,
      ],
      { encoding: "utf-8" },
    );
  }

  writing() {
    this.log("Writing 'sonarqube' files.");
    this.fs.copy(this.templatePath(".sonarqube"), this.destinationPath(this.module.path));
    this.log("To set a strong password for the admin account, read .sonarqube/README.md");
  }

  end() {
    this._savePrompts();
  }
};
