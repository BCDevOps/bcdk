"use strict";
const Generator = require("yeoman-generator");
const fsCore = require("fs");
const path = require("path");

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

    // eslint-disable-next-line handle-callback-err, prettier/prettier
    this.conflicter.checkForCollision(dst, this.fs.read(src), function(err, status) {
      if (status === "identical") return;
      //  The symlink may exist, but may link to a nonexistent file in which case `status` will be `'create'`, so try unlinking it anyway.
      //
      try {
        fsCore.unlinkSync(dst);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      fsCore.symlinkSync(path.relative(path.dirname(dst), src), dst);
    });
  }

  _module(name) {
    this.module = Object.assign(this.answers.modules[name] || {}, {
      name: name
    });
    this.answers.modules[name] = this.module;
    return this.module;
  }

  _component(name) {
    this.module.components = this.module.components || {};
    this.module.components[name] = Object.assign(
      this.module.components[name] || {},
      {
        name: name
      }
    );
    return this.module.components[name];
  }

  _savePrompts() {
    // console.log("Saving answers:");
    // console.dir(this.answers);
    this.config.set("promptValues", this.answers);
    this.config.save();
  }
};
