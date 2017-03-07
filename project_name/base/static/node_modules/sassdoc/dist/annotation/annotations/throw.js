'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports['default'] = throw_;

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

var autoParserError = /@error\s+(?:'|")([^'"]+)/g;

function throw_() {
  return {
    name: 'throw',

    parse: function parse(text) {
      return text.trim();
    },

    autofill: function autofill(item) {
      var match = undefined;
      var throwing = item.throws || [];

      while (match = autoParserError.exec(item.context.code)) {
        throwing.push(match[1]);
      }

      if (throwing.length > 0) {
        return _lodashUniq2['default'](throwing);
      }
    },

    alias: ['throws', 'exception'],

    allowedOn: ['function', 'mixin', 'placeholder']
  };
}

module.exports = exports['default'];