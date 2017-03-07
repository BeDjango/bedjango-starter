'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = notify;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

/**
 * Sometimes check for update and notify the user.
 *
 * @param {Object} pkg Package definition.
 * @param {Logger} logger
 */

function notify(pkg, logger) {
  var notifier = require('update-notifier')({
    packageName: pkg.name,
    packageVersion: pkg.version
  });

  if (!notifier.update) {
    return;
  }

  var latest = _chalk2['default'].yellow(notifier.update.latest);
  var current = _chalk2['default'].grey('(current: ' + notifier.update.current + ')');
  var command = _chalk2['default'].blue('npm update -g ' + pkg.name);

  logger.log('Update available: ' + latest + ' ' + current);
  logger.log('Run ' + command + ' to update.');
}

module.exports = exports['default'];