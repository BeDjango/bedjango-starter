'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports.denodeify = denodeify;
exports.defer = defer;
exports.g2b = g2b;

var _glob2base = require('glob2base');

var _glob2base2 = _interopRequireDefault(_glob2base);

var _glob = require('glob');

// Namespace delimiters.
var nsDelimiters = ['::', ':', '\\.', '/'];
var ns = new RegExp(nsDelimiters.join('|'), 'g');

// Split a namespace on possible namespace delimiters.
var splitNamespace = function splitNamespace(value) {
  return value.split(ns);
};

exports.splitNamespace = splitNamespace;

function denodeify(fn) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new _Promise(function (resolve, reject) {
      fn.apply(undefined, args.concat([function (err) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        if (err) {
          reject(err);
          return;
        }

        resolve.apply(undefined, args);
      }]));
    });
  };
}

function defer() {
  var resolve = undefined,
      reject = undefined;

  var promise = new _Promise(function (resolve_, reject_) {
    resolve = resolve_;
    reject = reject_;
  });

  return {
    promise: promise,
    resolve: resolve,
    reject: reject
  };
}

/**
 * Get the base directory of given glob pattern (see `glob2base`).
 *
 * If it's an array, take the first one.
 *
 * @param {Array|String} src Glob pattern or array of glob patterns.
 * @return {String}
 */

function g2b(src) {
  return _glob2base2['default'](new _glob.Glob([].concat(src)[0]));
}

/**
 * Type checking helpers.
 */
var toString = function toString(arg) {
  return Object.prototype.toString.call(arg);
};

var is = {
  undef: function undef(arg) {
    return arg === void 0;
  },
  string: function string(arg) {
    return typeof arg === 'string';
  },
  'function': function _function(arg) {
    return typeof arg === 'function';
  },
  object: function object(arg) {
    return typeof arg === 'object' && arg !== null;
  },
  plainObject: function plainObject(arg) {
    return toString(arg) === '[object Object]';
  },
  array: function array(arg) {
    return Array.isArray(arg);
  },
  error: function error(arg) {
    return is.object(arg) && (toString(arg) === '[object Error]' || arg instanceof Error);
  },
  promise: function promise(arg) {
    return arg && is['function'](arg.then);
  },
  stream: function stream(arg) {
    return arg && is['function'](arg.pipe);
  },
  vinylFile: function vinylFile(arg) {
    return is.plainObject(arg) && arg.constructor.name === 'File';
  }
};
exports.is = is;