'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports.checkLogger = checkLogger;

var _utils = require('./utils');

var _errors = require('./errors');

var errors = _interopRequireWildcard(_errors);

var _util = require('util');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var chalk = new _chalk2['default'].constructor({
  enabled: process.stderr && process.stderr.isTTY
});

// Special chars.
var chevron = '\xBB';
var checkmark = '✓';
var green = chalk.green(chevron);
var yellow = chalk.yellow(chevron);
var red = chalk.red(chevron);

var Logger = (function () {
  function Logger() {
    var verbose = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, Logger);

    this.verbose = verbose;
    this._stderr = process.stderr;
    this._debug = debug;
    this._times = [];
  }

  /**
   * Log arguments into stderr if the verbose mode is enabled.
   */

  Logger.prototype.log = function log() {
    if (this.verbose) {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var str = _util.format.apply(undefined, [green + ' ' + args.shift()].concat(args));
      this._stderr.write(str + '\n');
    }
  };

  /**
   * Always log arguments as warning into stderr.
   */

  Logger.prototype.warn = function warn() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var str = _util.format.apply(undefined, [yellow + ' [WARNING] ' + args.shift()].concat(args));
    this._stderr.write(str + '\n');
  };

  /**
   * Always log arguments as error into stderr.
   */

  Logger.prototype.error = function error() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var str = _util.format.apply(undefined, [red + ' [ERROR] ' + args.shift()].concat(args));
    this._stderr.write(str + '\n');
  };

  /**
   * Init a new timer.
   * @param {String} label
   */

  Logger.prototype.time = function time(label) {
    this._times[label] = Date.now();
  };

  /**
   * End timer and log result into stderr.
   * @param {String} label
   * @param {String} format
   */

  Logger.prototype.timeEnd = function timeEnd(label) {
    var format = arguments.length <= 1 || arguments[1] === undefined ? '%s: %dms' : arguments[1];

    if (!this.verbose) {
      return;
    }

    var time = this._times[label];
    if (!time) {
      throw new Error('No such label: ' + label);
    }

    var duration = Date.now() - time;

    var str = _util.format(chalk.green(checkmark) + ' ' + format, label, duration);
    this._stderr.write(str + '\n');
  };

  /**
   * Log arguments into stderr if debug mode is enabled (will call all
   * argument functions to allow "lazy" arguments).
   */

  Logger.prototype.debug = function debug() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    if (!this._debug) {
      return;
    }

    args = args.map(function (f) {
      if (f instanceof Function) {
        return f();
      }

      return f;
    });

    var str = _util.format.apply(undefined, ['' + _chalk2['default'].styles.grey.open + chevron + ' [DEBUG] ' + args.shift()].concat(args, [_chalk2['default'].styles.grey.close]));

    this._stderr.write(str + '\n');
  };

  return Logger;
})();

exports['default'] = Logger;
var empty = {
  log: function log() {},
  warn: function warn() {},
  error: function error() {},
  debug: function debug() {}
};

exports.empty = empty;
/**
 * Checks if given object looks like a logger.
 *
 * If the `debug` function is missing (like for the `console` object),
 * it will be set to an empty function in a newly returned object.
 *
 * If any other method is missing, an exception is thrown.
 *
 * @param {Object} logger
 * @return {Logger}
 * @throws {SassDocError}
 */

function checkLogger(logger) {
  var methods = ['log', 'warn', 'error'].filter(function (x) {
    return !(x in logger) || !_utils.is['function'](logger[x]);
  });

  if (methods.length) {
    var missing = '"' + methods.join('\`, \`') + '"';
    var s = methods.length > 1 ? 's' : '';

    throw new errors.SassDocError('Invalid logger, missing ' + missing + ' method' + s);
  }

  if ('debug' in logger) {
    return logger;
  }

  return {
    log: logger.log,
    warn: logger.warn,
    error: logger.error,
    debug: empty.debug
  };
}