'use strict';

exports.__esModule = true;
exports['default'] = author;

function author() {
  return {
    name: 'author',

    parse: function parse(text) {
      return text.trim();
    }
  };
}

module.exports = exports['default'];