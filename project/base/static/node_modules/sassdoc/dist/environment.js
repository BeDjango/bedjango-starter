'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Array$find = require('babel-runtime/core-js/array/find')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _utils = require('./utils');

var _errors = require('./errors');

var errors = _interopRequireWildcard(_errors);

var _events = require('events');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _sassConvert = require('sass-convert');

var _sassConvert2 = _interopRequireDefault(_sassConvert);

var Environment = (function (_EventEmitter) {
  _inherits(Environment, _EventEmitter);

  /**
   * @param {Logger} logger
   * @param {Boolean} strict
   */

  function Environment(logger) {
    // istanbul ignore next

    var _this = this;

    var strict = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, Environment);

    _EventEmitter.call(this);

    this.logger = logger;
    this.strict = strict;

    this.on('error', function (error) {
      var friendlyErrors = [errors.SassDocError, _sassConvert2['default'].BinaryError, _sassConvert2['default'].VersionError];

      if (_Array$find(friendlyErrors, function (c) {
        return error instanceof c;
      })) {
        logger.error(error.message);
      } else {
        if (_utils.is.error(error) && 'stack' in error) {
          logger.error(error.stack);
        } else {
          logger.error(error);
        }
      }
    });

    if (strict) {
      this.on('warning', function (warning) {
        return _this.emit('error', warning);
      });
    } else {
      this.on('warning', function (warning) {
        return logger.warn(warning.message);
      });
    }
  }

  /**
   * @param {Object|String} config
   */

  Environment.prototype.load = function load(config) {
    if (!config) {
      return this.loadDefaultFile();
    }

    if (_utils.is.string(config)) {
      return this.loadFile(config);
    }

    if (_utils.is.plainObject(config)) {
      return this.loadObject(config);
    }

    this.emit('error', new errors.SassDocError('Invalid `config` argument, expected string, object or undefined.'));
  };

  /**
   * Merge given configuration object, excluding reserved keys.
   *
   * @param {Object} config
   */

  Environment.prototype.loadObject = function loadObject(config) {
    if (this.file) {
      this.file = _path2['default'].resolve(this.file);
      this.dir = _path2['default'].dirname(this.file);
    }

    for (var _iterator = _Object$keys(config), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var k = _ref;

      if (k in this) {
        return this.emit('error', new Error('Reserved configuration key `' + k + '`.'));
      }

      this[k] = config[k];
    }
  };

  /**
   * Get the configuration object from given file.
   *
   * If the file is not found, emit a warning and fallback to default.
   *
   * The `dir` property will be the directory of the given file or the CWD
   * if no file is given. The configuration paths should be relative to
   * it.
   *
   * The given logger will be injected in the configuration object for
   * further usage.
   *
   * @param {String} file
   */

  Environment.prototype.loadFile = function loadFile(file) {
    this.file = file;

    if (!this.tryLoadCurrentFile()) {
      this.emit('warning', new errors.Warning('Config file `' + file + '` not found.'));
      this.logger.warn('Falling back to `.sassdocrc`');
      this.loadDefaultFile();
    }
  };

  /**
   * Try to load default `.sassdocrc` configuration file, or fallback
   * to an empty object.
   */

  Environment.prototype.loadDefaultFile = function loadDefaultFile() {
    this.file = '.sassdocrc';
    this.tryLoadCurrentFile();
  };

  /**
   * Post process the configuration to ensure `package` and `theme`
   * have uniform values.
   *
   * The `package` key is ensured to be an object. If it's a string, it's
   * required as JSON, relative to the configuration file directory.
   *
   * The `theme` key, if present and not already a function, will be
   * resolved to the actual theme function.
   */

  Environment.prototype.postProcess = function postProcess() {
    if (!this.dir) {
      this.dir = process.cwd();
    }

    if (!this.dest) {
      this.dest = 'sassdoc';
      this.destCwd = true;
    }

    this.dest = this.resolve(this.dest, this.destCwd);
    this.displayDest = _path2['default'].relative(process.cwd(), this.dest);

    if (!this['package']) {
      this.defaultPackage();
    }

    if (typeof this['package'] !== 'object') {
      this.loadPackage();
    }

    if (typeof this.theme !== 'function') {
      this.loadTheme();
    }
  };

  /**
   * Process `this.package`.
   */

  Environment.prototype.loadPackage = function loadPackage() {
    var file = this.resolve(this['package']);
    this['package'] = this.tryParseFile(file);

    if (this['package']) {
      return;
    }

    this.emit('warning', new errors.Warning('Package file `' + file + '` not found.'));
    this.logger.warn('Falling back to `package.json`.');

    this.defaultPackage();
  };

  /**
   * Load `package.json`.
   */

  Environment.prototype.defaultPackage = function defaultPackage() {
    var file = this.resolve('package.json');
    this['package'] = this.tryParseFile(file);

    if (this['package']) {
      return;
    }

    this.logger.warn('No package information.');
    this['package'] = {};
  };

  /**
   * Process `this.theme`.
   */

  Environment.prototype.loadTheme = function loadTheme() {
    if (this.theme === undefined) {
      return this.defaultTheme();
    }

    if (this.theme.indexOf('/') === -1) {
      return this.tryTheme('sassdoc-theme-' + this.theme);
    }

    var theme = this.resolve(this.theme, this.themeCwd);
    this.themeName = this.theme;
    this.displayTheme = _path2['default'].relative(process.cwd(), theme);

    return this.tryTheme(theme);
  };

  /**
   * Try to load given theme module, or fallback to default theme.
   *
   * @param {String} module
   */

  Environment.prototype.tryTheme = function tryTheme(module) {
    try {
      require.resolve(module);
    } catch (err) {
      this.emit('warning', new errors.Warning('Theme `' + this.theme + '` not found.'));
      this.logger.warn('Falling back to default theme.');
      return this.defaultTheme();
    }

    this.theme = require(module);
    var str = Object.prototype.toString;

    if (typeof this.theme !== 'function') {
      this.emit('error', new errors.SassDocError('Given theme is ' + str(this.theme) + ', expected ' + str(str) + '.' // eslint-disable-line comma-spacing
      ));

      return this.defaultTheme();
    }

    if (this.theme.length !== 2) {
      this.logger.warn('Given theme takes ' + this.theme.length + ' arguments, expected 2.');
    }
  };

  /**
   * Load `sassdoc-theme-default`.
   */

  Environment.prototype.defaultTheme = function defaultTheme() {
    try {
      require.resolve('sassdoc-theme-default');
    } catch (err) {
      this.emit('error', new errors.SassDocError('Holy shit, the default theme was not found!'));
    }

    this.theme = require('sassdoc-theme-default');
    this.themeName = this.displayTheme = 'default';
  };

  /**
   * Try to load `this.file`, and if not found, return `false`.
   *
   * @return {Boolean}
   */

  Environment.prototype.tryLoadCurrentFile = function tryLoadCurrentFile() {
    var config = this.tryParseFile(this.file);

    if (!config) {
      return false;
    }

    this.load(config);

    return true;
  };

  /**
   * Try `this.parseFile` and return `false` if an `ENOENT` error
   * is thrown.
   *
   * Other exceptions are passed to the `error` event.
   *
   * @param {String} file
   * @return {*}
   */

  Environment.prototype.tryParseFile = function tryParseFile(file) {
    try {
      return this.parseFile(file);
    } catch (e) {
      if (e.code !== 'ENOENT') {
        return this.emit('error', e);
      }
    }

    return false;
  };

  /**
   * Load YAML or JSON from given file.
   *
   * @param {String} file
   * @return {*}
   */

  Environment.prototype.parseFile = function parseFile(file) {
    return _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync(file, 'utf-8'));
  };

  /**
   * Resolve given file from `this.dir`.
   *
   * @param {String} file
   * @param {Boolean} cwd - whether it's relative to CWD (like when
   *                        defined in CLI).
   * @return {String}
   */

  Environment.prototype.resolve = function resolve(file) {
    var cwd = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    return _path2['default'].resolve(cwd ? process.cwd() : this.dir, file);
  };

  return Environment;
})(_events.EventEmitter);

exports['default'] = Environment;
module.exports = exports['default'];