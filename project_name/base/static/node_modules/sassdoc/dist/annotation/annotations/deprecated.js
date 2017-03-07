'use strict';

exports.__esModule = true;
exports['default'] = deprecated;

function deprecated() {

  return {
    name: 'deprecated',

    parse: function parse(text) {
      return text.trim();
    },

    multiple: false
  };
}

module.exports = exports['default'];