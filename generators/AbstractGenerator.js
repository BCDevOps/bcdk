"use strict";
const Generator = require("yeoman-generator");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    if (opts.__answers) {
      // console.log("Setting promptValues");
      this.answers = opts.__answers;
    } else {
      // console.log("Loading promptValues");
      this.answers = this.config.get("promptValues") || {};
      this.answers.modules = this.answers.modules || {};
      this.config.set("promptValues", this.answers);
    }
    this.props = {};
    if (!fs.existsSync(".git/objects")) {
      this.env.error(
        "It looks like you are not running from the root of a git working directory (Missing .git/objects)",
      );
    }
    const whoAmI = spawnSync("oc", ["whoami"], { encoding: "utf-8" });
    // eslint-disable-next-line no-negated-condition
    if (whoAmI.status !== 0) {
      this.env.error(
        `You are not authenticated in an OpenShift cluster.\nPlease run 'oc login ...' command copied from the Web Console:\nhttps://console.pathfinder.gov.bc.ca:8443/console/command-line\n`,
      );
    }
    const ocVersion = spawnSync("oc", ["version"], { encoding: "utf-8" });
    const openshiftVersion = [];
    const openshiftVersionRegex = /(?:(?:oc|openshift) v)(\d+\.\d+)/gm;
    const ocVersionStdout = ocVersion.stdout;

    let m;
    while ((m = openshiftVersionRegex.exec(ocVersionStdout)) !== null) {
      if (m.index === openshiftVersionRegex.lastIndex) {
        openshiftVersionRegex.lastIndex++;
      }
      openshiftVersion.push(m[1]);
    }
    if (!(openshiftVersion.length == 2 && openshiftVersion[0] == openshiftVersion[1])) {
      //could not find server version (minisihft?)
      if (openshiftVersion.length == 1) {
        const kubernetesVersion = ocVersion.stdout.match(/kubernetes v\d+\.\d+\.\d+/gm);
        if (!(kubernetesVersion.length == 2 && kubernetesVersion[0] == kubernetesVersion[1])) {
          this.env.error(
            // eslint-disable-next-line prettier/prettier
            `Your oc client kubernetes version (${kubernetesVersion[0]}) does not match the server kubernetes version (${kubernetesVersion[1]}).\nPlease get your client to align with the server version.\nYou can download it from:\nhttps://github.com/openshift/origin/releases/tag/`,
          );
        }
      } else {
        this.env.error(
          // eslint-disable-next-line prettier/prettier
          `Your oc client version (${openshiftVersion[0]}) does not match the server kubernetes version (${openshiftVersion[1]}).\nPlease get your client to align with the server version.\nYou can download it from:\nhttps://github.com/openshift/origin/releases/tag/v${openshiftVersion[1]}.0`,
        );
      }
    }
  }

  /*   emit(event, ...args) {
    this.log(`emitting "${event}" - ${args}`);
    return super.emit(event, ...args);
  }

  on(eventName, listener) {
    return super.on(eventName, listener);
  } */

  _writeFiles(done) {
    // this.log(`_writeFiles`);
    super._writeFiles(done);
  }

  /**
   *  Make a symbolic link within `#destinationRoot()`.
   *
   *  @method     _symLink
   *
   *  @param      {String}        src         The path relative to `#destinationRoot()` that should become the target of the symbolic link.
   *  @param      {String}        dst         The path relative to `#destinationRoot()` that should become the symbolic link.
   *
   */
  _symLink(src, dst) {
    src = this.destinationPath(src);
    dst = this.destinationPath(dst);
    const self = this;
    // WARNING: this is very hacky!!!
    // It forces the flushing/commit of the files up to here.
    this._writeFiles(() => {
      // eslint-disable-next-line handle-callback-err, prettier/prettier
      this.conflicter.checkForCollision(dst, this.fs.read(src), function(err, status) {
        if (status === "identical") return;
        //  The symlink may exist, but may link to a nonexistent file in which case `status` will be `'create'`, so try unlinking it anyway.
        //
        try {
          fs.unlinkSync(dst);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
        const relSrc = path.relative(path.dirname(dst), src);
        // console.log(`Creating symlink "${relSrc}" -> ${dst}`);
        const created = self._createIfMissing(src);
        self._createDirIfMissing(path.dirname(dst));
        fs.symlinkSync(relSrc, dst);
        if (created) {
          fs.unlinkSync(src);
        }
      });
    });
  }

  _createDirIfMissing(file) {
    fs.mkdirSync(file, { recursive: true });
  }

  _createIfMissing(file) {
    if (!fs.existsSync(file)) {
      this._createDirIfMissing(path.dirname(file));
      fs.closeSync(fs.openSync(file, "w"));
      return true;
    }
    return false;
  }

  _touch(path) {
    const time = new Date();
    try {
      fs.utimesSync(path, time, time);
    } catch (err) {
      fs.closeSync(fs.openSync(path, "w"));
    }
  }

  _setExecutable(file) {
    const isWindows = process.platform === "win32";
    if (isWindows) {
      this.log(`WARN: You MUST run: git update-index --chmod=+x ${file}`);
    } else {
      fs.chmodSync(file, fs.statSync(file).mode | fs.constants.S_IXUSR);
    }
  }

  _forEachFile(dir, cb) {
    fs.readdir(dir, function(e, files) {
      if (e) {
        console.log("Error: ", e);
        return;
      }
      files.forEach(function(file) {
        var fullPath = path.join(dir, file);
        fs.stat(fullPath, function(e, f) {
          if (e) {
            console.log("Error: ", e);
            return;
          }
          if (f.isDirectory()) {
            this._forEachFile(fullPath);
          } else {
            cb(fullPath);
          }
        });
      });
    });
  }

  _module(name) {
    this.module = Object.assign(this.answers.modules[name] || {}, {
      name: name,
    });
    this.answers.modules[name] = this.module;
    return this.module;
  }

  _component(name) {
    this.module.components = this.module.components || {};
    this.module.components[name] = Object.assign(this.module.components[name] || {}, {
      name: name,
    });
    return this.module.components[name];
  }

  _savePrompts() {
    // console.log("Saving answers:");
    // console.dir(this.answers);
    this.config.set("promptValues", this.answers);
    this.config.save();
  }

  _promptModuleName() {
    if (this.options.module) {
      return new Promise(resolve => {
        //this.module.name = this.options.name;
        resolve(this.module);
      });
    }

    return this.prompt([
      {
        type: "input",
        name: "name",
        // eslint-disable-next-line prettier/prettier
        message: "What is this module name?",
        default: this.module.name || this.options.name,
      },
    ]).then(answers => {
      this.module.name = answers.name;
      return this.module;
    });
  }
};
