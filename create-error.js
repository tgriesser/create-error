//     create-error.js 0.1.0
//     (c) 2013 Tim Griesser
//     This source may be freely distributed under the MIT license.
(function(define) { "use strict";

// A simple utility for subclassing the "Error"
// object in multiple environments, while maintaining
// relevant stack traces, messages, and prototypes.
define(function(_) {

// Creates an new error type with a "name",
// and any additional properties that should be set
// on the error instance.
return function() {
  var args = new Array(arguments.length);
  for (var i = 0; i < args.length; ++i) {
    args[i] = arguments[i];
  }
  var name       = getName(args);
  var target     = getTarget(args);
  var properties = getProps(args);

  function ErrorCtor(message) {
    if (_.isPlainObject(properties)) {
      var keys = inheritedKeys(properties);
      for (var i = 0, l = keys.length; i < l; ++i) {
        this[keys[i]] = _.clone(properties[keys[i]]);
      }
    }
    this.message = message;
    this.cause = message;
    if (message instanceof Error) {
      this.message = message.message;
      this.stack = message.stack;
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  function Err() { this.constructor = ErrorCtor; }
  Err.prototype = target['prototype'];
  ErrorCtor.prototype = new Err();
  ErrorCtor.prototype.name = ('' + name) || 'CustomError';
  return ErrorCtor;
};

// -----
// Just a few helpers to ensure the codeblock clean and quick:
// https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
// -----
function getName(args) {
  if (args.length === 0) return '';
  return isError(args[0]) ? (args[1] || '') : args[0];
}
function getTarget(args) {
  if (args.length === 0) return Error;
  return isError(args[0]) ? args[0] : Error;
}
function getProps(args) {
  if (args.length === 0) return null;
  return isError(args[0]) ? args[2] : args[1];
}
function inheritedKeys(obj) {
  var ret = [];
  for (var key in obj) {
    ret.push(key);
  }
  return ret;
}

// Right now we're just assuming that a function in the first argument is an error.
function isError(obj) {
  return (typeof obj === "function");
}

});

// Boilerplate UMD definition block...
})(function(createErrorLib) {
  if (typeof define === "function" && define.amd) {
    define(['lodash'], createErrorLib);
  } else if (typeof exports === 'object') {
    module.exports = createErrorLib(require('lodash'));
  } else {
    var root = this;
    var lastcreateError = root.createError;
    var createError = root.createError = createErrorLib(root._);
    createError.noConflict = function() {
      root.createError = lastcreateError;
      return createError;
    };
  }
});