'use strict';

exports.__esModule = true;
exports['default'] = group;

function group() {
  return {
    name: 'group',

    parse: function parse(text) {
      return [text.trim().toLowerCase()];
    },

    'default': function _default() {
      return ['undefined'];
    },

    multiple: false
  };
}

module.exports = exports['default'];