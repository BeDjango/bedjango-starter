'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;
exports['default'] = cli;

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _sassdoc = require('./sassdoc');

var _sassdoc2 = _interopRequireDefault(_sassdoc);

var _errors = require('./errors');

var errors = _interopRequireWildcard(_errors);

var _docopt = require('docopt');

var _vinylSourceStream = require('vinyl-source-stream');

var _vinylSourceStream2 = _interopRequireDefault(_vinylSourceStream);

var _packageJson = require('../package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

var doc = '\nUsage:\n  sassdoc - [options]\n  sassdoc <src>... [options]\n\nArguments:\n  <src>  Path to your Sass folder.\n\nOptions:\n  -h, --help            Bring help.\n  --version             Show version.\n  -v, --verbose         Enable verbose mode.\n  -d, --dest=<dir>      Documentation folder.\n  -c, --config=<path>   Path to JSON/YAML configuration file.\n  -t, --theme=<name>    Theme to use.\n  -p, --parse           Parse the input and output JSON data to stdout.\n  --no-update-notifier  Disable update notifier check.\n  --strict              Turn warnings into errors.\n  --debug               Output debugging information.\n';

function cli() {
  var argv = arguments.length <= 0 || arguments[0] === undefined ? process.argv.slice(2) : arguments[0];

  var options = _docopt.docopt(doc, { version: _packageJson2['default'].version, argv: argv });

  if (!options['-'] && !options['<src>'].length) {
    // Trigger help display.
    _docopt.docopt(doc, { version: _packageJson2['default'].version, argv: ['--help'] });
  }

  var logger = new _logger2['default'](options['--verbose'], options['--debug'] || process.env.SASSDOC_DEBUG);
  var env = new _environment2['default'](logger, options['--strict']);

  logger.debug('argv:', function () {
    return JSON.stringify(argv);
  });

  env.on('error', function (error) {
    if (error instanceof errors.Warning) {
      process.exit(2);
    }

    process.exit(1);
  });

  env.load(options['--config']);

  // Ensure CLI options.
  ensure(env, options, {
    dest: '--dest',
    theme: '--theme',
    noUpdateNotifier: '--no-update-notifier'
  });

  env.postProcess();

  // Run update notifier if not explicitely disabled.
  if (!env.noUpdateNotifier) {
    require('./notifier')(_packageJson2['default'], logger);
  }

  var handler = undefined,
      cb = undefined;

  // Whether to parse only or to documentize.
  if (!options['--parse']) {
    handler = _sassdoc2['default'];
    cb = function () {};
  } else {
    handler = _sassdoc.parse;
    cb = function (data) {
      return console.log(JSON.stringify(data, null, 2));
    };
  }

  if (options['-']) {
    return process.stdin.pipe(_vinylSourceStream2['default']()).pipe(handler(env)).on('data', cb);
  }

  handler(options['<src>'], env).then(cb);
}

/**
 * Ensure that CLI options take precedence over configuration values.
 *
 * For each name/option tuple, if the option is set, override configuration
 * value.
 */
function ensure(env, options, names) {
  for (var _iterator = _Object$keys(names), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
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

    var v = names[k];

    if (options[v]) {
      env[k] = options[v];
      env[k + 'Cwd'] = true;
    }
  }
}
module.exports = exports['default'];