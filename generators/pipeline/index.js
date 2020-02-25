"use strict";

const { createReadStream, existsSync, readFileSync } = require("fs");
const readline = require("readline");
const Generator = require("../AbstractGenerator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    // this.option("module", { type: String, required: false, desc: "My option" });
    this.option("environments", {
      type: String,
      required: false,
      // eslint-disable-next-line prettier/prettier
      desc: "Environment names (E.g. build, dev, test, prod) separated by space."
    });
    // the name of the generator
    this.name = "default";

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
            // eslint-disable-next-line prettier/prettier
            message: "What is this module id/key?",
            default: "hello",
          },
        ]).then(answers => {
          this.options.module = answers.module;
        });
      }
      this.module = this.answers.modules[this.options.module] || {};
      this.answers.modules[this.options.module] = this.module;
    }

    await this.prompt([
      {
        type: "input",
        name: "name",
        // eslint-disable-next-line prettier/prettier
        message: "What is this module name?",
        default: this.module.name || this.options.name,
      },
      {
        type: "input",
        name: "version",
        // eslint-disable-next-line prettier/prettier
        message: "What is this module version?",
        default: this.module.version || this.options.version || "1.0.0",
      },
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
          default: defaultEnvironments,
        },
      ]).then(answers => {
        this.options.environments = answers.environments;
      });
    } else {
      this.log(`Environments: ${this.options.environments}`);
    }

    await this.prompt([
      {
        type: "input",
        name: "path",
        // eslint-disable-next-line prettier/prettier
        message: "What is the source code directory for this module?",
        default: this.module.path || ".",
      },
    ]).then(answers => {
      this.module.path = answers.path;
    });

    const environments = {};
    this.module.environments = this.module.environments || {};
    // eslint-disable-next-line prettier/prettier
    this.options.environments.trim().split(" ")
      .forEach(item => {
        environments[item] = this.module.environments ? this.module.environments[item] : {};
      });
    this.module.environments = environments;
    if (
      !Object.keys(environments).includes("build") ||
      !Object.keys(environments).includes("prod")
    ) {
      this.env.error(
        `'build' and 'prod' environments are mandatory, but you provided "${this.options.environments.trim()}"`,
      );
    }
    const prompts = [];
    Object.keys(environments).forEach(item => {
      prompts.push({
        type: "input",
        name: `${item.trim()}`,
        message: `What namespace/project name is used for '${item.trim()}'?`,
        // eslint-disable-next-line prettier/prettier
        default: (environments[item.trim()] || {}).namespace || this.module.namespace || ""
      });
    });

    await this.prompt(prompts).then(answers => {
      Object.keys(answers).forEach(item => {
        environments[item] = environments[item] || {};
        environments[item].namespace = answers[item];
      });
    });
  }

  async writing() {
    this.log("Writing 'pipeline' files.");
    this.fs.copyTpl(
      this.templatePath(`.pipeline`),
      this.destinationPath(`${this.module.path}/.pipeline`),
      this.module,
    );
    this.fs.copy(
      this.templatePath(`.pipeline/.nvmrc`),
      this.destinationPath(`${this.module.path}/.pipeline/.nvmrc`),
    );
    this.fs.copy(
      this.templatePath(`Jenkinsfile`),
      this.destinationPath(`${this.module.path}/Jenkinsfile`),
    );
    const dstDotGitIgnore = this.destinationPath(`.gitignore`);
    if (existsSync(dstDotGitIgnore)) {
      const reader = readline.createInterface({
        input: createReadStream(dstDotGitIgnore),
        crlfDelay: Infinity,
        terminal: false,
      });
      let foundNodeModulesEntry = false;
      await new Promise(resolve => {
        reader.on("line", line => {
          foundNodeModulesEntry =
            line.startsWith("node_modules/") || line.startsWith("**/node_modules/");
          if (foundNodeModulesEntry) {
            reader.close();
          }
        });
        reader.on("close", () => {
          resolve(true);
        });
      });
      if (!foundNodeModulesEntry) {
        let content = readFileSync(dstDotGitIgnore, { encoding: "utf8" });
        if (content.charAt(content.length - 1) != "\n") {
          content += "\n";
        }
        content += "node_modules/\n";
        this.fs.write(dstDotGitIgnore, content);
      }
    } else {
      this.fs.write(dstDotGitIgnore, "node_modules/\n");
    }
  }

  install() {
    this.log(`Installing Node Modules in ${this.module.path}/.pipeline`);
    this.npmInstall([], {}, { cwd: `${this.module.path}/.pipeline` });
  }

  end() {
    this._setExecutable(this.destinationPath(`${this.module.path}/.pipeline/npmw`));
    this._savePrompts();
  }
};
