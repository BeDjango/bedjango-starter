'use strict';

exports.__esModule = true;
exports['default'] = output;

function output() {
  return {
    name: 'output',

    parse: function parse(text) {
      return text.trim();
    },

    alias: ['outputs'],

    allowedOn: ['mixin'],

    multiple: false
  };
}

module.exports = exports['default'];