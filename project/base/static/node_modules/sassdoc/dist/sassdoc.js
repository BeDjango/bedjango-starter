'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Array$find = require('babel-runtime/core-js/array/find')['default'];

var _Object$getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;
exports.parseFilter = parseFilter;
exports.ensureEnvironment = ensureEnvironment;
exports['default'] = sassdoc;
exports.parse = parse;

var _utils = require('./utils');

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _errors = require('./errors');

var errors = _interopRequireWildcard(_errors);

var _sorter = require('./sorter');

var _sorter2 = _interopRequireDefault(_sorter);

var _exclude = require('./exclude');

var _exclude2 = _interopRequireDefault(_exclude);

var _recurse = require('./recurse');

var _recurse2 = _interopRequireDefault(_recurse);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodashDifference = require('lodash.difference');

var _lodashDifference2 = _interopRequireDefault(_lodashDifference);

var _safeWipe = require('safe-wipe');

var _safeWipe2 = _interopRequireDefault(_safeWipe);

var _vinylFs = require('vinyl-fs');

var _vinylFs2 = _interopRequireDefault(_vinylFs);

var _sassConvert = require('sass-convert');

var _sassConvert2 = _interopRequireDefault(_sassConvert);

var _multipipe = require('multipipe');

var _multipipe2 = _interopRequireDefault(_multipipe);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var mkdir = _utils.denodeify(require('mkdirp'));

/**
 * Expose lower API blocks.
 */
exports.Environment = _environment2['default'];
exports.Logger = _logger2['default'];
exports.Parser = _parser2['default'];
exports.sorter = _sorter2['default'];
exports.errors = errors;

/**
 * Boostrap Parser and AnnotationsApi, execute parsing phase.
 * @return {Stream}
 * @return {Promise} - as a property of Stream.
 */

function parseFilter() {
  var env = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  env = ensureEnvironment(env);

  var parser = new _parser2['default'](env, env.theme && env.theme.annotations);

  return parser.stream();
}

/**
 * Ensure a proper Environment Object and events.
 * @param {Object} config - can be falsy.
 * @return {Object}
 */

function ensureEnvironment(config) {
  var onError = arguments.length <= 1 || arguments[1] === undefined ? function (e) {
    throw e;
  } : arguments[1];

  if (config instanceof _environment2['default']) {
    config.on('error', onError);
    return config;
  }

  var logger = ensureLogger(config);
  var env = new _environment2['default'](logger, config && config.strict);

  env.on('error', onError);
  env.load(config);
  env.postProcess();

  return env;
}

/**
 * @param {Object} config
 * @return {Logger}
 */
function ensureLogger(config) {
  if (!_utils.is.object(config) || !('logger' in config)) {
    // Get default logger.
    return new _logger2['default'](config && config.verbose, process.env.SASSDOC_DEBUG);
  }

  var logger = _logger.checkLogger(config.logger);
  delete config.logger;

  return logger;
}

/**
 * Default public API method.
 * @param {String | Array} src
 * @param {Object} env
 * @return {Promise | Stream}
 * @see srcEnv
 */

function sassdoc() {
  return srcEnv(documentize, stream).apply(undefined, arguments);

  /**
   * Safely wipe and re-create the destination directory.
   * @return {Promise}
   */
  function refresh(env) {
    return _safeWipe2['default'](env.dest, {
      force: true,
      parent: _utils.is.string(env.src) || _utils.is.array(env.src) ? _utils.g2b(env.src) : null,
      silent: true
    }).then(function () {
      return mkdir(env.dest);
    }).then(function () {
      env.logger.log('Folder `' + env.displayDest + '` successfully refreshed.');
    })['catch'](function (err) {
      // Friendly error for already existing directory.
      throw new errors.SassDocError(err.message);
    });
  }

  /**
   * Render theme with parsed data context.
   * @return {Promise}
   */
  function theme(env) {
    var promise = env.theme(env.dest, env);

    if (!_utils.is.promise(promise)) {
      var type = Object.prototype.toString.call(promise);
      throw new errors.Error('Theme didn\'t return a promise, got ' + type + '.');
    }

    return promise.then(function () {
      var displayTheme = env.displayTheme || 'anonymous';
      env.logger.log('Theme `' + displayTheme + '` successfully rendered.');
    });
  }

  /**
   * Execute full SassDoc sequence from a source directory.
   * @return {Promise}
   */
  function documentize(env) {
    var data;
    return _regeneratorRuntime.async(function documentize$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          init(env);
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(baseDocumentize(env));

        case 3:
          data = context$2$0.sent;
          context$2$0.prev = 4;
          context$2$0.next = 7;
          return _regeneratorRuntime.awrap(refresh(env));

        case 7:
          context$2$0.next = 9;
          return _regeneratorRuntime.awrap(theme(env));

        case 9:
          okay(env);
          context$2$0.next = 16;
          break;

        case 12:
          context$2$0.prev = 12;
          context$2$0.t0 = context$2$0['catch'](4);

          env.emit('error', context$2$0.t0);
          throw context$2$0.t0;

        case 16:
          return context$2$0.abrupt('return', data);

        case 17:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this, [[4, 12]]);
  }

  /**
   * Execute full SassDoc sequence from a Vinyl files stream.
   * @return {Stream}
   * @return {Promise} - as a property of Stream.
   */
  function stream(env) {
    var filter = parseFilter(env);

    filter.promise.then(function (data) {
      env.logger.log('Sass sources successfully parsed.');
      env.data = data;
      onEmpty(data, env);
    });

    /**
     * Returned Promise await the full sequence,
     * instead of just the parsing step.
     */
    filter.promise = new _Promise(function (resolve, reject) {

      function documentize() {
        return _regeneratorRuntime.async(function documentize$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.prev = 0;

              init(env);
              context$4$0.next = 4;
              return _regeneratorRuntime.awrap(refresh(env));

            case 4:
              context$4$0.next = 6;
              return _regeneratorRuntime.awrap(theme(env));

            case 6:
              okay(env);
              resolve();
              context$4$0.next = 15;
              break;

            case 10:
              context$4$0.prev = 10;
              context$4$0.t0 = context$4$0['catch'](0);

              reject(context$4$0.t0);
              env.emit('error', context$4$0.t0);
              throw context$4$0.t0;

            case 15:
            case 'end':
              return context$4$0.stop();
          }
        }, null, this, [[0, 10]]);
      }

      filter.on('end', documentize).on('error', function (err) {
        return env.emit('error', err);
      }).resume(); // Drain.
    });

    return filter;
  }
}

/**
 * Parse and return data object.
 * @param {String | Array} src
 * @param {Object} env
 * @return {Promise | Stream}
 * @see srcEnv
 */

function parse() {

  return srcEnv(documentize, stream).apply(undefined, arguments);

  /**
   * @return {Promise}
   */
  function documentize(env) {
    var data;
    return _regeneratorRuntime.async(function documentize$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return _regeneratorRuntime.awrap(baseDocumentize(env));

        case 2:
          data = context$2$0.sent;
          return context$2$0.abrupt('return', data);

        case 4:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  /**
   * Don't pass files through, but pass final data at the end.
   * @return {Stream}
   */
  function stream(env) {
    var parseStream = parseFilter(env);

    var filter = _through22['default'].obj(function (file, enc, cb) {
      return cb();
    }, function (cb) {
      // istanbul ignore next

      var _this = this;

      parseStream.promise.then(function (data) {
        _this.push(data);
        cb();
      }, cb);
    });

    return _multipipe2['default'](parseStream, filter);
  }
}

/**
 * Source directory fetching and parsing.
 */
function baseDocumentize(env) {
  var filter, streams, pipeline;
  return _regeneratorRuntime.async(function baseDocumentize$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        filter = parseFilter(env);

        filter.promise.then(function (data) {
          env.logger.log('Folder `' + env.src + '` successfully parsed.');
          env.data = data;
          onEmpty(data, env);

          env.logger.debug(function () {
            _fs2['default'].writeFile('sassdoc-data.json', JSON.stringify(data, null, 2) + '\n');

            return 'Dumping data to `sassdoc-data.json`.';
          });
        });

        streams = [_vinylFs2['default'].src(env.src), _recurse2['default'](), _exclude2['default'](env.exclude || []), _sassConvert2['default']({ from: 'sass', to: 'scss' }), filter];

        pipeline = function pipeline() {
          return new _Promise(function (resolve, reject) {
            _multipipe2['default'].apply(undefined, streams.concat([function (err) {
              return err ? reject(err) : resolve();
            }])).resume(); // Drain.
          });
        };

        context$1$0.prev = 4;
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(pipeline());

      case 7:
        context$1$0.next = 13;
        break;

      case 9:
        context$1$0.prev = 9;
        context$1$0.t0 = context$1$0['catch'](4);

        env.emit('error', context$1$0.t0);
        throw context$1$0.t0;

      case 13:
        return context$1$0.abrupt('return', env.data);

      case 14:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[4, 9]]);
}

/**
 * Return a function taking optional `src` string or array, and optional
 * `env` object (arguments are found by their type).
 *
 * If `src` is set, proxy to `documentize`, otherwise `stream`.
 *
 * Both functions will be passed the `env` object, which will have a
 * `src` key.
 */
function srcEnv(documentize, stream) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var src = _Array$find(args, function (a) {
      return _utils.is.string(a) || _utils.is.array(a);
    });
    var env = _Array$find(args, _utils.is.plainObject);

    env = ensureEnvironment(env);

    env.logger.debug('process.argv:', function () {
      return JSON.stringify(process.argv);
    });
    env.logger.debug('sassdoc version:', function () {
      return require('../package.json').version;
    });
    env.logger.debug('node version:', function () {
      return process.version.substr(1);
    });

    env.logger.debug('npm version:', function () {
      var prefix = _path2['default'].resolve(process.execPath, '../../lib');
      var pkg = _path2['default'].resolve(prefix, 'node_modules/npm/package.json');

      try {
        return require(pkg).version;
      } catch (e) {
        return 'unknown';
      }
    });

    env.logger.debug('platform:', function () {
      return process.platform;
    });
    env.logger.debug('cwd:', function () {
      return process.cwd();
    });

    env.src = src;

    env.logger.debug('env:', function () {
      var clone = {};

      _lodashDifference2['default'](_Object$getOwnPropertyNames(env), ['domain', '_events', '_maxListeners', 'logger']).forEach(function (k) {
        return clone[k] = env[k];
      });

      return JSON.stringify(clone, null, 2);
    });

    var task = env.src ? documentize : stream;
    env.logger.debug('task:', function () {
      return env.src ? 'documentize' : 'stream';
    });

    return task(env);
  };
}

/**
 * Warn user on empty documentation.
 * @param {Array} data
 * @param {Object} env
 */
function onEmpty(data, env) {
  var message = 'SassDoc could not find anything to document.\n\n  * Are you still using `/**` comments ? They\'re no more supported since 2.0.\n    See <http://sassdoc.com/upgrading/#c-style-comments>.\n  * Are you documenting actual Sass items (variables, functions, mixins, placeholders) ?\n    SassDoc doesn\'t support documenting CSS selectors.\n    See <http://sassdoc.com/frequently-asked-questions/#does-sassdoc-support-css-classes-and-ids->.\n';

  if (!data.length) {
    env.emit('warning', new errors.Warning(message));
  }
}

/**
 * Init timer.
 * @param {Object} env
 */
function init(env) {
  env.logger.time('SassDoc');
}

/**
 * Log final success message.
 * @param {Object} env
 */
function okay(env) {
  env.logger.log('Process over. Everything okay!');
  env.logger.timeEnd('SassDoc', '%s completed after %dms');
}