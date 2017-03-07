'use strict';

exports.__esModule = true;
exports['default'] = todo;

function todo() {
  return {
    name: 'todo',

    parse: function parse(text) {
      return text.trim();
    },

    alias: ['todos']
  };
}

module.exports = exports['default'];