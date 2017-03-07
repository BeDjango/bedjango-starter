'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _utils = require('./utils');

var _errors = require('./errors');

var errors = _interopRequireWildcard(_errors);

var _annotation = require('./annotation');

var _annotation2 = _interopRequireDefault(_annotation);

var _sorter = require('./sorter');

var _sorter2 = _interopRequireDefault(_sorter);

var _scssCommentParser = require('scss-comment-parser');

var _scssCommentParser2 = _interopRequireDefault(_scssCommentParser);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var Parser = (function () {
  function Parser(env, additionalAnnotations) {
    _classCallCheck(this, Parser);

    this.annotations = new _annotation2['default'](env);
    this.annotations.addAnnotations(additionalAnnotations);
    this.scssParser = new _scssCommentParser2['default'](this.annotations.list, env);

    this.scssParser.commentParser.on('warning', function (warning) {
      env.emit('warning', new errors.Warning(warning.message));
    });
  }

  Parser.prototype.parse = function parse(code, id) {
    return this.scssParser.parse(code, id);
  };

  /**
   * Invoke the `resolve` function of an annotation if present.
   * Called with all found annotations except with type "unkown".
   */

  Parser.prototype.postProcess = function postProcess(data) {
    // istanbul ignore next

    var _this = this;

    data = _sorter2['default'](data);

    _Object$keys(this.annotations.list).forEach(function (key) {
      var annotation = _this.annotations.list[key];

      if (annotation.resolve) {
        annotation.resolve(data);
      }
    });

    return data;
  };

  /**
   * Return a transform stream meant to be piped in a stream of SCSS
   * files. Each file will be passed-through as-is, but they are all
   * parsed to generate a SassDoc data array.
   *
   * The returned stream has an additional `promise` property, containing
   * a `Promise` object that will be resolved when the stream is done and
   * the data is fulfiled.
   *
   * @param {Object} parser
   * @return {Object}
   */

  Parser.prototype.stream = function stream() {
    // istanbul ignore next

    var _this2 = this;

    var deferred = _utils.defer();
    var data = [];

    var transform = function transform(file, enc, cb) {
      // Pass-through.
      cb(null, file);

      var parseFile = function parseFile(_ref) {
        var buf = _ref.buf;
        var name = _ref.name;
        var path = _ref.path;

        var fileData = _this2.parse(buf.toString(enc), name);

        fileData.forEach(function (item) {
          item.file = {
            path: path,
            name: name
          };

          data.push(item);
        });
      };

      if (file.isBuffer()) {
        var args = {
          buf: file.contents,
          name: _path2['default'].basename(file.relative),
          path: file.relative
        };

        parseFile(args);
      }

      if (file.isStream()) {
        file.pipe(_concatStream2['default'](function (buf) {
          parseFile({ buf: buf });
        }));
      }
    };

    var flush = function flush(cb) {
      data = data.filter(function (item) {
        return item.context.type !== 'unknown';
      });
      data = _this2.postProcess(data);

      deferred.resolve(data);
      cb();
    };

    var filter = _through22['default'].obj(transform, flush);
    filter.promise = deferred.promise;

    return filter;
  };

  return Parser;
})();

exports['default'] = Parser;
module.exports = exports['default'];