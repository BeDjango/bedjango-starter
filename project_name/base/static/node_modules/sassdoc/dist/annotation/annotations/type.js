'use strict';

exports.__esModule = true;
exports['default'] = type;

function type() {
  return {
    name: 'type',

    parse: function parse(text) {
      return text.trim();
    },

    allowedOn: ['variable'],

    multiple: false
  };
}

module.exports = exports['default'];