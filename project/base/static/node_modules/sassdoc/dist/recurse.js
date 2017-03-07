'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = recurse;

var _utils = require('./utils');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _vinylFs = require('vinyl-fs');

var _vinylFs2 = _interopRequireDefault(_vinylFs);

/**
 * Return a transform stream recursing through directory to yield
 * Sass/SCSS files instead.
 *
 * @return {Object}
 */

function recurse() {
  return _through22['default'].obj(function (file, enc, cb) {
    // istanbul ignore next

    var _this = this;

    if (!_utils.is.vinylFile(file)) {
      // Don't know how to handle this object.
      return cb(new Error('Unsupported stream object. Vinyl file expected.'));
    }

    if (file.isBuffer() || file.isStream()) {
      // Pass-through.
      return cb(null, file);
    }

    if (!file.isDirectory()) {
      // At that stage we want only dirs. Dismiss file.isNull.
      return cb();
    }

    // It's a directory, find inner Sass/SCSS files.
    var pattern = _path2['default'].resolve(file.path, '**/*.+(sass|scss)');

    _vinylFs2['default'].src(pattern).pipe(_through22['default'].obj(function (file, enc, cb) {
      // Append to "parent" stream.
      _this.push(file);
      cb();
    }, function () {
      // All done.
      cb();
    }));
  });
}

module.exports = exports['default'];