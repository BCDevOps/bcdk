/* eslint-disable capitalized-comments */
"use strict";
const Generator = require("../AbstractGenerator");
const chalk = require("chalk");
const { spawnSync } = require("child_process");
const moduleId = "jenkins";

module.exports = class extends Generator {
  async prompting() {
    this.module = this.answers.modules[moduleId] || {};
    this.answers.modules[moduleId] = this.module;
    this.module.path = ".jenkins";
    this.module.name = this.module.name || "jenkins";

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

    const gitHubSecret = spawnSync(
      "oc",
      [
        "-n",
        this.module.namespace,
        "get",
        `secret/template.${this.module.name}-github`,
        `secret/template.${this.module.name}-slave-user`,
      ],
      { encoding: "utf-8" },
    );
    if (gitHubSecret.status !== 0) {
      this.log(`One or more required secrets are missing.`);
      await this.prompt([
        {
          type: "input",
          name: "GH_USERNAME",
          // eslint-disable-next-line prettier/prettier
          message: "We will need a GitHub username. We strongly recommend creating an account shared with the team for CI/CD/Automation purposes.\n",
        },
        {
          type: "password",
          name: "GH_PASSWORD",
          // eslint-disable-next-line prettier/prettier
          message: `What is the personal access token for the GitHub account?
          See https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line
          Required priveleges: public_repo, repo:status, repo_deployment, admin:repo_hook`,
        },
      ]).then(answers => {
        const ocSecrets = spawnSync(
          "oc",
          [
            "-n",
            this.module.namespace,
            "new-app",
            "-f",
            `${this.templatePath(".jenkins")}/openshift/deploy-prereq.yaml`,
            `--param=NAME=${this.module.name}`,
            `--param=GH_USERNAME=${answers.GH_USERNAME}`,
            `--param=GH_ACCESS_TOKEN=${answers.GH_PASSWORD}`,
          ],
          { encoding: "utf-8" },
        );
        if (ocSecrets.status !== 0) {
          console.log(ocSecrets.args.join(" "));
          console.log(ocSecrets.stdout);
          console.log(ocSecrets.stderr);
          this.env.error("Error creating secrets.");
        }
      });
    }
  }

  createJenkinsPipeline() {
    //Object.assign(this.module, { name: this.module.name || "jenkins" });
    this.composeWith(require.resolve("../pipeline"), {
      module: this.module,
      __answers: this.answers,
      environments: "build dev prod",
    });
  }

  createJenkinsJob() {
    this.composeWith(require.resolve("../jenkins-job"), {
      module: this.module,
      name: "_jenkins",
      jenkinsFilePath: `${this.module.path}/Jenkinsfile`,
      __answers: this.answers,
    });
  }

  createJenkinsOverwrites() {
    this.composeWith(require.resolve("../jenkins-overwrites"), {
      path: this.module.path,
      __answers: this.answers,
    });
  }

  writing() {
    this.log("Writing 'jenkins' files.");
    this.fs.copy(this.templatePath(".jenkins"), this.destinationPath(this.module.path));
  }

  end() {
    this._savePrompts();
  }
};
