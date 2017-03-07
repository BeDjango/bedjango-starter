'use strict';

var _Array$find = require('babel-runtime/core-js/array/find')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = exclude;

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

/**
 * @param {Array} patterns
 * @return {Object}
 */

function exclude(patterns) {
  return _through22['default'].obj(function (file, enc, cb) {
    if (_Array$find(patterns, function (x) {
      return _minimatch2['default'](file.relative, x);
    })) {
      return cb();
    }

    cb(null, file);
  });
}

module.exports = exports['default'];